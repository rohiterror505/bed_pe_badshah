export type Vec2 = { x: number; y: number };

export type GamePhase = 'menu' | 'howto' | 'settings' | 'countdown' | 'playing' | 'paused' | 'gameover';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type EnemyKind = 'puneet' | 'rakhi' | 'mcstan';

export interface Settings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  dialogueVolume: number;
  adultHumor: boolean;
  difficulty: Difficulty;
  reducedShake: boolean;
  characterToggles: Record<EnemyKind, boolean>;
  muted: boolean;
}

export interface GameStats {
  score: number;
  kills: number;
  shots: number;
  hits: number;
  misses: number;
  bestCombo: number;
  combo: number;
  timeLeft: number;
}

export interface FinalResult {
  stats: GameStats;
  personalBest: number;
  isNewBest: boolean;
  message: string;
}

export interface DialogueLine {
  text: string;
  audioKey?: string;
}

export interface SpeechBubble {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface FloatingScore {
  id: number;
  x: number;
  y: number;
  value: string;
  color: string;
  life: number;
  vy: number;
}