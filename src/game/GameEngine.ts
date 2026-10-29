import type { AudioManager } from '../audio/AudioManager';
import type { DialogueManager } from '../audio/DialogueManager';
import type { Settings, GameStats, SpeechBubble, FloatingScore, FinalResult } from '../types/game';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { CollisionSystem } from './CollisionSystem';
import { ParticleSystem } from './ParticleSystem';
import { SpawnManager } from './SpawnManager';
import { ScoreManager } from './ScoreManager';
import { ImageCache } from './ImageCache';
import { gameOverMessages } from '../data/characterDialogues';

export interface GameEngineCallbacks {
  onStats: (stats: GameStats) => void;
  onBubbles: (bubbles: SpeechBubble[]) => void;
  onFloatingScores: (scores: FloatingScore[]) => void;
  onGameOver: (result: FinalResult) => void;
}

const ROUND_TIME = 90;

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private audio: AudioManager;
  private dialogue: DialogueManager;
  private settings: Settings;
  private cb: GameEngineCallbacks;

  private player: Player;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private particles = new ParticleSystem();
  private spawner: SpawnManager;
  private score: ScoreManager;

  private rafId = 0;
  private lastTime = 0;
  private running = false;
  private paused = false;
  private aiming: { x: number; y: number } = { x: 0, y: 0 };
  private logicalW = 0;
  private logicalH = 0;

  private bubbles: SpeechBubble[] = [];
  private floatingScores: FloatingScore[] = [];
  private nextId = 1;
  private shake = 0;
  private fanAngle = 0;
  private personalBest: number;
  private countdown = 3;
  private countdownTimer = 0;
  private inCountdown = true;

  private statsEmitTimer = 0;
  private images = new ImageCache();

  constructor(
    canvas: HTMLCanvasElement,
    audio: AudioManager,
    dialogue: DialogueManager,
    settings: Settings,
    callbacks: GameEngineCallbacks,
    personalBest: number
  ) {
    this.canvas = canvas;
    const c = canvas.getContext('2d');
    if (!c) throw new Error('No 2D context');
    this.ctx = c;
    this.audio = audio;
    this.dialogue = dialogue;
    this.settings = settings;
    this.cb = callbacks;
    this.personalBest = personalBest;
    this.score = new ScoreManager(ROUND_TIME);
    this.spawner = new SpawnManager(settings.difficulty, this.images);
    const w = canvas.clientWidth || canvas.width;
    const h = canvas.clientHeight || canvas.height;
    this.logicalW = w;
    this.logicalH = h;
    this.player = new Player(w / 2, h - 80, this.images);
  }

  async preload(): Promise<void> {
    await this.images.loadAll();
  }

  start() {
    this.resize();
    this.aiming = { x: this.logicalW / 2, y: this.logicalH * 0.45 };
    this.running = true;
    this.paused = false;
    this.inCountdown = true;
    this.countdown = 3;
    this.countdownTimer = 0;
    this.lastTime = performance.now();
    this.audio.startMusic();
    this.loop(this.lastTime);
  }

  setAiming(x: number, y: number) {
    this.aiming = { x, y };
  }

  shoot() {
    if (!this.running || this.paused || this.inCountdown) return;
    const muzzle = this.player.getMuzzle();
    const dx = this.aiming.x - muzzle.x;
    const dy = this.aiming.y - muzzle.y;
    const len = Math.hypot(dx, dy) || 1;
    const dir = { x: dx / len, y: dy / len };
    this.player.fire(dir);
    const proj = new Projectile(muzzle, dir, 900);
    this.projectiles.push(proj);
    this.score.registerShot();
    this.audio.play('shoot', 0.7);
    // Amitabh's voice on every shot
    const shootText = this.dialogue.triggerShoot();
    this.addBubble(this.player.pos.x, this.player.pos.y - 60, shootText, '#ff1744', 1.2);
    this.particles.smoke(muzzle, 5);
    this.shake = Math.min(this.shake + 6, 20);
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; this.lastTime = performance.now(); }
  isPaused() { return this.paused; }

  applySettings(s: Settings) {
    this.settings = s;
    this.audio.applySettings(s);
    this.dialogue.applySettings(s);
  }

  private loop = (now: number) => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    if (!this.paused) this.update(dt);
    this.render();
  };

  private update(dt: number) {
    this.fanAngle += dt * 2;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 30);

    if (this.inCountdown) {
      this.countdownTimer += dt;
      if (this.countdownTimer >= 1) {
        this.countdownTimer = 0;
        this.countdown--;
        if (this.countdown < 0) {
          this.inCountdown = false;
        }
      }
      this.emitState();
      return;
    }

    this.score.tick(dt);
    if (this.score.stats.timeLeft <= 0) {
      this.endGame();
      return;
    }

    this.player.update(dt);

    const spawn = this.spawner.update(dt, performance.now(), this.logicalW, this.logicalH, this.enemies.length);
    if (spawn) {
      this.enemies.push(spawn.enemy);
      if (spawn.isSpecial) {
        this.audio.play('explosion', 0.5);
      }
    }

    // Enemies update + dodge against projectiles (no dialogue)
    for (const e of this.enemies) {
      e.update(dt, this.logicalW, this.logicalH);
      for (const p of this.projectiles) {
        if (p.alive && e.alive) e.tryDodge(p.pos.x, p.pos.y);
      }
    }

    // Projectiles update + collision
    for (const p of this.projectiles) {
      p.update(dt, this.logicalW, this.logicalH);
      if (!p.alive) continue;
      let hit = false;
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (CollisionSystem.circleHit(p.pos.x, p.pos.y, p.radius, e.pos.x, e.pos.y, e.radius)) {
          p.alive = false;
          e.hp--;
          e.hitFlash = 1;
          hit = true;
          const res = this.score.registerHit(e.scoreValue);
          this.score.registerKill();
          this.particles.burst(e.pos, 24, [this.kindColor(e.kind), '#ffea00', '#ff1744'], 260, 0.7, 200);
          this.addFloatingScore(e.pos.x, e.pos.y, `+${res.gained}`, '#ffea00');
          if (e.isSpecial) {
            this.audio.play('explosion', 0.9);
          } else {
            this.audio.play('hit', 0.8);
          }
          // Killed enemy's voice (only on a kill)
          const killText = this.dialogue.triggerKill(e.kind);
          this.addBubble(e.pos.x, e.pos.y - 40, killText, this.kindColor(e.kind), 1.6);
          e.alive = false;
          this.shake = Math.min(this.shake + (e.isSpecial ? 16 : 8), 26);
          break;
        }
      }
      if (!hit && !p.alive) {
        // projectile expired without hit -> miss -> Amitabh voice
        this.score.registerMiss();
        this.dialogue.triggerMiss();
      }
    }

    this.enemies = this.enemies.filter((e) => e.alive);
    this.projectiles = this.projectiles.filter((p) => p.alive);
    this.particles.update(dt);

    // bubbles & floating scores
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      this.bubbles[i].life -= dt;
      if (this.bubbles[i].life <= 0) this.bubbles.splice(i, 1);
    }
    for (let i = this.floatingScores.length - 1; i >= 0; i--) {
      const f = this.floatingScores[i];
      f.life -= dt;
      f.y += f.vy * dt;
      if (f.life <= 0) this.floatingScores.splice(i, 1);
    }

    this.statsEmitTimer += dt;
    if (this.statsEmitTimer > 0.1) {
      this.statsEmitTimer = 0;
      this.emitState();
    }
  }

  private findNearestEnemy(x: number, y: number): Enemy | null {
    let best: Enemy | null = null;
    let bestD = Infinity;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = Math.hypot(e.pos.x - x, e.pos.y - y);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  private kindColor(kind: string): string {
    if (kind === 'puneet') return '#ff8a3d';
    if (kind === 'rakhi') return '#ff4d8d';
    return '#22d3ee';
  }

  private addBubble(x: number, y: number, text: string, color: string, life: number) {
    this.bubbles.push({ id: this.nextId++, x, y, text, color, life, maxLife: life });
    if (this.bubbles.length > 8) this.bubbles.shift();
    this.cb.onBubbles([...this.bubbles]);
  }

  private addFloatingScore(x: number, y: number, value: string, color: string) {
    this.floatingScores.push({ id: this.nextId++, x, y, value, color, life: 1.0, vy: -60 });
    this.cb.onFloatingScores([...this.floatingScores]);
  }

  private emitState() {
    const s: GameStats = { ...this.score.stats, combo: this.score.stats.combo, bestCombo: this.score.stats.bestCombo };
    this.cb.onStats(s);
  }

  private render() {
    const ctx = this.ctx;
    const w = this.logicalW;
    const h = this.logicalH;
    const sx = this.settings.reducedShake ? 0 : (Math.random() - 0.5) * this.shake;
    const sy = this.settings.reducedShake ? 0 : (Math.random() - 0.5) * this.shake;

    ctx.save();
    ctx.translate(sx, sy);
    this.drawBackground(ctx, w, h);
    this.particles.draw(ctx);
    this.player.draw(ctx);
    for (const e of this.enemies) e.draw(ctx);
    for (const p of this.projectiles) p.draw(ctx);
    this.drawBubbles(ctx);
    this.drawFloatingScores(ctx);

    // Aim reticle
    if (!this.inCountdown) {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.aiming.x, this.aiming.y, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(this.aiming.x - 20, this.aiming.y); ctx.lineTo(this.aiming.x - 8, this.aiming.y);
      ctx.moveTo(this.aiming.x + 8, this.aiming.y); ctx.lineTo(this.aiming.x + 20, this.aiming.y);
      ctx.moveTo(this.aiming.x, this.aiming.y - 20); ctx.lineTo(this.aiming.x, this.aiming.y - 8);
      ctx.moveTo(this.aiming.x, this.aiming.y + 8); ctx.lineTo(this.aiming.x, this.aiming.y + 20);
      ctx.stroke();
    }

    if (this.inCountdown) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-50, -50, w + 100, h + 100);
      ctx.fillStyle = '#ffea00';
      const size = Math.max(48, Math.min(120, Math.floor(Math.min(w, h) * 0.18)));
      ctx.font = `${size}px Bangers, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const txt = this.countdown > 0 ? String(this.countdown) : 'SHOOT!';
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 30;
      ctx.fillText(txt, w / 2, h / 2);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  private drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Wall gradient
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1a0b2e');
    g.addColorStop(0.6, '#2d1b4e');
    g.addColorStop(1, '#1a0b2e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Posters
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(40, 50, 80, 110);
    ctx.fillStyle = '#ff1744';
    ctx.font = '14px Bangers, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHAHENSHAH', 80, 110);
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(w - 130, 60, 90, 120);
    ctx.fillStyle = '#000';
    ctx.fillText('DRAMA QUEEN', w - 85, 125);

    // Ceiling fan
    const fx = w / 2;
    const fy = 60;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(this.fanAngle);
    ctx.fillStyle = '#4a4a4a';
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillRect(-4, -50, 8, 60);
    }
    ctx.restore();
    ctx.fillStyle = '#333';
    ctx.fillRect(fx - 4, 0, 8, 30);

    // Floor
    ctx.fillStyle = '#3a1a1a';
    ctx.fillRect(0, h - 40, w, 40);
  }

  private drawBubbles(ctx: CanvasRenderingContext2D) {
    for (const b of this.bubbles) {
      const a = Math.min(1, b.life / 0.3);
      ctx.globalAlpha = a;
      ctx.font = '16px system-ui, sans-serif';
      const tw = ctx.measureText(b.text).width;
      const bw = tw + 20;
      const bh = 28;
      const bx = Math.min(Math.max(b.x - bw / 2, 4), this.logicalW - bw - 4);
      const by = b.y - bh;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 8);
      ctx.fill();
      ctx.stroke();
      // tail
      ctx.beginPath();
      ctx.moveTo(bx + bw / 2 - 6, by + bh);
      ctx.lineTo(bx + bw / 2, by + bh + 8);
      ctx.lineTo(bx + bw / 2 + 6, by + bh);
      ctx.fill();
      ctx.fillStyle = b.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.text, bx + bw / 2, by + bh / 2);
      ctx.globalAlpha = 1;
    }
  }

  private drawFloatingScores(ctx: CanvasRenderingContext2D) {
    for (const f of this.floatingScores) {
      const a = Math.min(1, f.life / 0.4);
      ctx.globalAlpha = a;
      ctx.fillStyle = f.color;
      ctx.font = '24px Bangers, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.value, f.x, f.y);
      ctx.globalAlpha = 1;
    }
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // logical (CSS-pixel) dimensions used for all gameplay math
    const w = rect.width;
    const h = rect.height;
    this.logicalW = w;
    this.logicalH = h;
    this.player.pos.x = w / 2;
    this.player.pos.y = h - 95;
    // Crotch = center of the lying body
    this.player.fireOrigin.x = this.player.pos.x;
    this.player.fireOrigin.y = this.player.pos.y - 8;
    // keep aim inside bounds
    this.aiming.x = Math.min(Math.max(this.aiming.x, 0), w);
    this.aiming.y = Math.min(Math.max(this.aiming.y, 0), h);
  }

  private endGame() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.audio.stopMusic();
    const final = this.score.stats.score;
    const isNewBest = final > this.personalBest;
    const newBest = Math.max(final, this.personalBest);
    const message = gameOverMessages[Math.floor(Math.random() * gameOverMessages.length)];
    const result: FinalResult = {
      stats: { ...this.score.stats },
      personalBest: newBest,
      isNewBest,
      message,
    };
    this.cb.onGameOver(result);
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.audio.stopMusic();
  }
}