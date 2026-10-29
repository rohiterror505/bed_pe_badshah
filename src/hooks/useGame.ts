import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioManager } from '../audio/AudioManager';
import { DialogueManager } from '../audio/DialogueManager';
import { GameEngine } from '../game/GameEngine';
import type { FinalResult, GamePhase, GameStats, Settings, SpeechBubble, FloatingScore } from '../types/game';

const DEFAULT_SETTINGS: Settings = {
  masterVolume: 0.8,
  musicVolume: 0.4,
  sfxVolume: 0.7,
  dialogueVolume: 0.9,
  adultHumor: true,
  difficulty: 'normal',
  reducedShake: false,
  characterToggles: { puneet: true, rakhi: true, mcstan: true },
  muted: false,
};

const SETTINGS_KEY = 'bpb_settings';
const BEST_KEY = 'bpb_best';

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

function loadBest(): number {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch { return 0; }
}

export function useGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [personalBest, setPersonalBest] = useState<number>(loadBest);
  const [stats, setStats] = useState<GameStats>({ score: 0, kills: 0, shots: 0, hits: 0, misses: 0, bestCombo: 0, combo: 0, timeLeft: 90 });
  const [bubbles, setBubbles] = useState<SpeechBubble[]>([]);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [result, setResult] = useState<FinalResult | null>(null);
  const [paused, setPaused] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const audioRef = useRef<AudioManager | null>(null);
  const dialogueRef = useRef<DialogueManager | null>(null);

  useEffect(() => {
    const audio = new AudioManager(settings);
    audioRef.current = audio;
    dialogueRef.current = new DialogueManager(audio, settings);
    return () => {
      engineRef.current?.dispose();
      audio.dispose();
    };
  }, []);

  useEffect(() => {
    audioRef.current?.applySettings(settings);
    dialogueRef.current?.applySettings(settings);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  }, [settings]);

  const startGame = useCallback(async () => {
    const audio = audioRef.current!;
    const dialogue = dialogueRef.current!;
    await audio.init();
    audio.resume();
    setStats({ score: 0, kills: 0, shots: 0, hits: 0, misses: 0, bestCombo: 0, combo: 0, timeLeft: 90 });
    setBubbles([]);
    setFloatingScores([]);
    setResult(null);
    setPaused(false);
    engineRef.current?.dispose();
    engineRef.current = null;
    setPhase('countdown');
    requestAnimationFrame(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const engine = new GameEngine(
        canvas,
        audio,
        dialogue,
        settings,
        {
          onStats: (s) => setStats(s),
          onBubbles: (b) => setBubbles(b),
          onFloatingScores: (f) => setFloatingScores(f),
          onGameOver: (r) => {
            setResult(r);
            setPersonalBest(r.personalBest);
            try { localStorage.setItem(BEST_KEY, String(r.personalBest)); } catch { /* ignore */ }
            setPhase('gameover');
          },
        },
        personalBest
      );
      engineRef.current = engine;
      await engine.preload();
      engine.resize();
      engine.start();
      setPhase('playing');
    });
  }, [settings, personalBest]);

  const togglePause = useCallback(() => {
    setPaused((p) => {
      const np = !p;
      if (np) setPhase('paused'); else setPhase('playing');
      return np;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setSettings((s) => ({ ...s, muted: !s.muted }));
  }, []);

  const goMenu = useCallback(() => {
    engineRef.current?.dispose();
    engineRef.current = null;
    setPhase('menu');
    setPaused(false);
  }, []);

  return {
    phase, setPhase, settings, setSettings, personalBest, stats, bubbles, floatingScores,
    result, paused, canvasRef, engineRef, audioRef,
    startGame, togglePause, toggleMute, goMenu,
  };
}