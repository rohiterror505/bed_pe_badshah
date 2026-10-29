import type { AudioManager } from './AudioManager';
import type { EnemyKind, Settings } from '../types/game';

// Only four voices are used in the whole game:
//  - Amitabh's "maa ka bhosda aag" -> played on EVERY shot (and on a miss)
//  - Puneet / Rakhi / MC Stan voice -> played ONLY when that enemy is killed
const SHOOT_TEXT = 'MAA KA BHOSDA AAG!';
const KILL_TEXT: Record<EnemyKind, string> = {
  puneet: 'AAO SAALO!',
  rakhi: 'DRAMA QUEEN!',
  mcstan: 'TERI MAA KI!',
};

const VOICE_KEY = {
  amitabh: 'amitabh:kill',
  puneet: 'puneet:voice',
  rakhi: 'rakhi:voice',
  mcstan: 'mcstan:voice',
} as const;

export class DialogueManager {
  private settings: Settings;
  private audio: AudioManager;
  private lastShoot = 0;
  private shootCooldown = 220; // avoid insane overlap on rapid fire

  constructor(audio: AudioManager, settings: Settings) {
    this.audio = audio;
    this.settings = settings;
  }

  applySettings(s: Settings) {
    this.settings = s;
  }

  // Called on every shot. Plays Amitabh's "maa ka bhosda aag".
  triggerShoot(): string {
    const now = performance.now();
    if (now - this.lastShoot >= this.shootCooldown) {
      this.lastShoot = now;
      this.audio.play(VOICE_KEY.amitabh, 1);
    }
    return SHOOT_TEXT;
  }

  // Called on a miss (projectile expired without hit). Same Amitabh voice.
  triggerMiss(): string {
    const now = performance.now();
    if (now - this.lastShoot >= this.shootCooldown) {
      this.lastShoot = now;
      this.audio.play(VOICE_KEY.amitabh, 1);
    }
    return SHOOT_TEXT;
  }

  // Called only on a confirmed kill. Plays the killed enemy's voice.
  triggerKill(kind: EnemyKind): string {
    if (!this.settings.characterToggles[kind]) return KILL_TEXT[kind];
    // MC Stan clip is long -> only play the first 3 seconds from the start.
    if (kind === 'mcstan') {
      this.audio.play(VOICE_KEY[kind], 1, 3.0);
    } else {
      this.audio.play(VOICE_KEY[kind], 1);
    }
    return KILL_TEXT[kind];
  }

  stopAll() {
    this.audio.stopAllDialogue();
  }
}