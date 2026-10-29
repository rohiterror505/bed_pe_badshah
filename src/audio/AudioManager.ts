import { audioAssets } from './audioConfig';
import type { Settings } from '../types/game';

interface ActiveSource {
  source: AudioBufferSourceNode;
  gain: GainNode;
  key: string;
  ended: boolean;
}

export class AudioManager {
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private failedKeys = new Set<string>();
  private active = new Set<ActiveSource>();
  private musicSource: ActiveSource | null = null;
  private settings: Settings;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private dialogueGain: GainNode | null = null;
  private initialized = false;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);
      this.dialogueGain = this.ctx.createGain();
      this.dialogueGain.connect(this.masterGain);
      this.applySettings(this.settings);
      this.ensureVoices();
      await this.preload();
      this.initialized = true;
    } catch (e) {
      console.warn('AudioManager init failed', e);
    }
  }

  private async preload(): Promise<void> {
    if (!this.ctx) return;
    const tasks = audioAssets.map(async (a) => {
      if (this.buffers.has(a.key) || this.failedKeys.has(a.key)) return;
      try {
        const res = await fetch(a.path);
        if (!res.ok) {
          this.failedKeys.add(a.key);
          return;
        }
        const arr = await res.arrayBuffer();
        const buf = await this.ctx!.decodeAudioData(arr);
        this.buffers.set(a.key, buf);
        this.buffers.set(a.path, buf);
        this.dialogueBufCache.set(a.path, buf);
      } catch {
        this.failedKeys.add(a.key);
      }
    });
    await Promise.all(tasks);
  }

  applySettings(s: Settings): void {
    this.settings = s;
    if (!this.ctx || !this.masterGain) return;
    const muted = s.muted ? 0 : 1;
    this.masterGain.gain.value = s.masterVolume * muted;
    if (this.musicGain) this.musicGain.gain.value = s.musicVolume;
    if (this.sfxGain) this.sfxGain.gain.value = s.sfxVolume;
    if (this.dialogueGain) this.dialogueGain.gain.value = s.dialogueVolume;
  }

  resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  private getBus(key: string): GainNode | null {
    if (!this.ctx) return null;
    if (key === 'background') return this.musicGain;
    if (key.startsWith('amitabh') || key.startsWith('puneet') || key.startsWith('rakhi') || key.startsWith('mcstan')) return this.dialogueGain;
    return this.sfxGain;
  }

  play(key: string, volume = 1, maxDuration?: number): void {
    if (!this.ctx || !this.initialized) return;
    const buf = this.buffers.get(key);
    if (!buf) return;
    const bus = this.getBus(key);
    if (!bus) return;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    gain.connect(bus);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(gain);
    const active: ActiveSource = { source: src, gain, key, ended: false };
    src.onended = () => {
      active.ended = true;
      this.active.delete(active);
    };
    if (maxDuration != null) {
      // Play from the start (offset 0) for maxDuration seconds
      const dur = Math.min(maxDuration, buf.duration);
      src.start(this.ctx.currentTime, 0, dur);
    } else {
      src.start();
    }
    this.active.add(active);
  }

  playDialogue(path: string, volume = 1): void {
    if (!this.ctx || !this.initialized) return;
    const buf = this.buffers.get(path) || this.buffers.get(path);
    if (!buf) {
      this.tryDecodeDialogue(path, volume);
      return;
    }
    this.playBufferOnBus(buf, this.dialogueGain!, volume);
  }

  private dialogueBufCache = new Map<string, AudioBuffer>();
  private async tryDecodeDialogue(path: string, volume: number): Promise<void> {
    if (!this.ctx || this.dialogueBufCache.has(path)) {
      const b = this.dialogueBufCache.get(path);
      if (b) this.playBufferOnBus(b, this.dialogueGain!, volume);
      return;
    }
    if (this.failedKeys.has(path)) return;
    try {
      const res = await fetch(path);
      if (!res.ok) {
        this.failedKeys.add(path);
        return;
      }
      const arr = await res.arrayBuffer();
      const buf = await this.ctx.decodeAudioData(arr);
      this.dialogueBufCache.set(path, buf);
      this.playBufferOnBus(buf, this.dialogueGain!, volume);
    } catch {
      this.failedKeys.add(path);
    }
  }

  private playBufferOnBus(buf: AudioBuffer, bus: GainNode, volume: number): void {
    if (!this.ctx) return;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    gain.connect(bus);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(gain);
    const active: ActiveSource = { source: src, gain, key: buf.toString(), ended: false };
    src.onended = () => {
      active.ended = true;
      this.active.delete(active);
    };
    src.start();
    this.active.add(active);
  }

  startMusic(): void {
    if (!this.ctx || !this.initialized) return;
    if (this.musicSource) return;
    const buf = this.buffers.get('background');
    if (!buf) return;
    const gain = this.ctx.createGain();
    gain.connect(this.musicGain!);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(gain);
    const active: ActiveSource = { source: src, gain, key: 'background', ended: false };
    src.onended = () => {
      active.ended = true;
      this.active.delete(active);
    };
    src.start();
    this.musicSource = active;
  }

  stopMusic(): void {
    if (this.musicSource) {
      try { this.musicSource.source.stop(); } catch { /* ignore */ }
      this.musicSource = null;
    }
  }

  stopAllDialogue(): void {
    if (!this.ctx) return;
    for (const a of Array.from(this.active)) {
      if (a.key !== 'background') {
        try { a.source.stop(); } catch { /* ignore */ }
      }
    }
    this.cancelSpeech();
  }

  // ---- Web Speech API TTS (synthesized parody voices) ----
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;
  private ttsEnabled = typeof window !== 'undefined' && 'speechSynthesis' in window;

  private ensureVoices(): void {
    if (!this.ttsEnabled) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length) {
        this.voices = v;
        this.voicesLoaded = true;
      }
    };
    load();
    if (!this.voicesLoaded) {
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  speak(text: string, opts: { pitch?: number; rate?: number; volume?: number; lang?: string } = {}): void {
    if (!this.ttsEnabled) return;
    if (this.settings.muted) return;
    if (!this.voicesLoaded) this.ensureVoices();
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.pitch = opts.pitch ?? 1;
      u.rate = opts.rate ?? 1;
      u.volume = Math.min(1, Math.max(0, this.settings.dialogueVolume * this.settings.masterVolume * (opts.volume ?? 1)));
      u.lang = opts.lang ?? 'en-IN';
      if (this.voices.length) {
        const preferred = this.voices.find((v) => v.lang && v.lang.startsWith('en-IN'))
          || this.voices.find((v) => v.lang && v.lang.startsWith('en'))
          || this.voices[0];
        if (preferred) u.voice = preferred;
      }
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('TTS failed', e);
    }
  }

  cancelSpeech(): void {
    if (this.ttsEnabled) {
      try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
    }
  }

  hasAudio(path: string): boolean {
    return this.buffers.has(path) || this.dialogueBufCache.has(path);
  }

  dispose(): void {
    this.stopMusic();
    this.cancelSpeech();
    for (const a of Array.from(this.active)) {
      try { a.source.stop(); } catch { /* ignore */ }
    }
    this.active.clear();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
  }
}