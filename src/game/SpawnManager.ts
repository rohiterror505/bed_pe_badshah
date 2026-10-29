import type { Difficulty, EnemyKind } from '../types/game';
import { Enemy } from './Enemy';
import type { ImageCache } from './ImageCache';

const DIFF: Record<Difficulty, { baseSpeed: number; spawnInterval: number; maxAlive: number; speedGrowth: number; mcStanChance: number }> = {
  easy: { baseSpeed: 55, spawnInterval: 700, maxAlive: 4, speedGrowth: 3, mcStanChance: 0.08 },
  normal: { baseSpeed: 80, spawnInterval: 550, maxAlive: 5, speedGrowth: 5, mcStanChance: 0.12 },
  hard: { baseSpeed: 110, spawnInterval: 420, maxAlive: 6, speedGrowth: 7, mcStanChance: 0.16 },
};

export class SpawnManager {
  private difficulty: Difficulty;
  private lastSpawn = 0;
  private elapsed = 0;
  private wave = 1;
  private mcStanChance: number;
  private images: ImageCache | null;
  private toggle = false;

  constructor(difficulty: Difficulty, images: ImageCache | null = null) {
    this.difficulty = difficulty;
    this.mcStanChance = DIFF[difficulty].mcStanChance;
    this.images = images;
  }

  reset() {
    this.lastSpawn = 0;
    this.elapsed = 0;
    this.wave = 1;
    this.toggle = false;
  }

  get config() { return DIFF[this.difficulty]; }

  update(dt: number, now: number, width: number, height: number, aliveCount: number): { enemy: Enemy; isSpecial: boolean; wave: number } | null {
    this.elapsed += dt;
    const growth = Math.floor(this.elapsed / 15);
    const cfg = DIFF[this.difficulty];
    const interval = Math.max(300, cfg.spawnInterval - growth * 80);
    this.wave = 1 + growth;

    // On small screens cap total enemies to keep the phone readable.
    // Desktop keeps the difficulty-based cap plus wave growth.
    const isMobile = width < 768;
    const baseCap = isMobile ? Math.min(cfg.maxAlive, 5) : cfg.maxAlive;
    const growthBonus = isMobile ? Math.min(1, growth) : Math.min(3, growth);
    const maxAlive = baseCap + growthBonus;

    if (now - this.lastSpawn > interval && aliveCount < maxAlive) {
      this.lastSpawn = now;
      // Strictly alternate so MC Stan and Rakhi always appear in equal quantity
      const kind: EnemyKind = this.toggle ? 'mcstan' : 'rakhi';
      this.toggle = !this.toggle;
      const isSpecial = kind === 'mcstan';
      const speed = cfg.baseSpeed + cfg.speedGrowth * growth + Math.random() * 40;
      // Spawn near the visible play area so action is immediate & continuous
      const side = Math.random();
      let x: number, y: number;
      const topZone = 70;
      const flyH = height * 0.55;
      if (side < 0.35) { x = -10; y = topZone + Math.random() * flyH; }
      else if (side < 0.7) { x = width + 10; y = topZone + Math.random() * flyH; }
      else { x = 60 + Math.random() * (width - 120); y = topZone + Math.random() * flyH; }
      return { enemy: new Enemy(kind, x, y, speed, this.wave, this.images), isSpecial, wave: this.wave };
    }
    return null;
  }
}