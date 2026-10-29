import type { GameStats } from '../types/game';

export class ScoreManager {
  stats: GameStats;
  private combo = 0;
  bestCombo = 0;

  constructor(timeLimit: number) {
    this.stats = {
      score: 0, kills: 0, shots: 0, hits: 0, misses: 0,
      bestCombo: 0, combo: 0, timeLeft: timeLimit,
    };
  }

  registerShot() {
    this.stats.shots++;
  }

  registerHit(scoreValue: number): { gained: number; combo: number } {
    this.stats.hits++;
    this.combo++;
    this.stats.combo = this.combo;
    const multiplier = 1 + Math.floor(this.combo / 3) * 0.5;
    const gained = Math.round(scoreValue * multiplier);
    this.stats.score += gained;
    if (this.combo > this.bestCombo) {
      this.bestCombo = this.combo;
      this.stats.bestCombo = this.combo;
    }
    return { gained, combo: this.combo };
  }

  registerMiss() {
    this.stats.misses++;
    this.combo = 0;
    this.stats.combo = 0;
  }

  registerKill() {
    this.stats.kills++;
  }

  accuracy(): number {
    if (this.stats.shots === 0) return 0;
    return Math.round((this.stats.hits / this.stats.shots) * 100);
  }

  tick(dt: number) {
    this.stats.timeLeft = Math.max(0, this.stats.timeLeft - dt);
  }
}