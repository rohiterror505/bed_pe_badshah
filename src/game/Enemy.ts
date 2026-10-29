import type { EnemyKind, Vec2 } from '../types/game';
import type { ImageCache, CharacterImage } from './ImageCache';

const COLORS: Record<EnemyKind, { primary: string; secondary: string; accent: string }> = {
  puneet: { primary: '#ff8a3d', secondary: '#ffd166', accent: '#ef476f' },
  rakhi: { primary: '#ff4d8d', secondary: '#ffb3d9', accent: '#a855f7' },
  mcstan: { primary: '#22d3ee', secondary: '#1e293b', accent: '#facc15' },
};

const IMG_KEY: Record<EnemyKind, CharacterImage> = {
  puneet: 'puneet',
  rakhi: 'rakhi',
  mcstan: 'mcstan',
};

export class Enemy {
  kind: EnemyKind;
  pos: Vec2;
  vel: Vec2;
  radius: number;
  alive = true;
  hp = 1;
  scoreValue = 100;
  spawnTime: number;
  bobPhase = Math.random() * Math.PI * 2;
  facing = 1;
  hitFlash = 0;
  isSpecial: boolean;
  nextDodge = 0;
  wave: number;
  private images: ImageCache | null;
  private spin = 0;

  constructor(kind: EnemyKind, x: number, y: number, speed: number, wave: number, images: ImageCache | null = null) {
    this.kind = kind;
    this.pos = { x, y };
    const angle = Math.random() * Math.PI * 2;
    this.vel = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed * 0.7 };
    this.radius = kind === 'mcstan' ? 34 : 30;
    this.spawnTime = performance.now();
    this.isSpecial = kind === 'mcstan';
    this.scoreValue = kind === 'mcstan' ? 500 : 100;
    this.nextDodge = performance.now() + 800 + Math.random() * 1500;
    this.wave = wave;
    this.images = images;
  }

  update(dt: number, width: number, height: number) {
    this.bobPhase += dt * 4;
    this.spin += dt * 3;
    this.hitFlash = Math.max(0, this.hitFlash - dt * 4);
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.facing = this.vel.x >= 0 ? 1 : -1;

    // Bounds bounce
    if (this.pos.x < this.radius) { this.pos.x = this.radius; this.vel.x = Math.abs(this.vel.x); }
    if (this.pos.x > width - this.radius) { this.pos.x = width - this.radius; this.vel.x = -Math.abs(this.vel.x); }
    if (this.pos.y < this.radius) { this.pos.y = this.radius; this.vel.y = Math.abs(this.vel.y); }
    if (this.pos.y > height * 0.7) { this.pos.y = height * 0.7; this.vel.y = -Math.abs(this.vel.y); }

    // Random dodge attempts
    if (performance.now() > this.nextDodge) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.hypot(this.vel.x, this.vel.y) * (1.0 + Math.random() * 0.2);
      this.vel.x = Math.cos(a) * s;
      this.vel.y = Math.sin(a) * s * 0.7;
      this.nextDodge = performance.now() + 1800 + Math.random() * 2500;
      return true;
    }
    return false;
  }

  tryDodge(projectileX: number, projectileY: number): boolean {
    const dx = this.pos.x - projectileX;
    const dy = this.pos.y - projectileY;
    const dist = Math.hypot(dx, dy);
    if (dist < 90 && dist > 0) {
      if (Math.random() < (this.isSpecial ? 0.22 : 0.12)) {
        const perpX = -dy / dist;
        const perpY = dx / dist;
        const dir = Math.random() < 0.5 ? 1 : -1;
        const speed = Math.hypot(this.vel.x, this.vel.y) * 1.1;
        this.vel.x = perpX * dir * speed;
        this.vel.y = perpY * dir * speed * 0.7;
        this.nextDodge = performance.now() + 1200 + Math.random() * 1800;
        return true;
      }
    }
    return false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const c = COLORS[this.kind];
    const bob = Math.sin(this.bobPhase) * 4;
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y + bob);

    // Aura ring for special
    if (this.isSpecial) {
      ctx.shadowColor = c.accent;
      ctx.shadowBlur = 24;
    }

    const img = this.images?.get(IMG_KEY[this.kind]) ?? null;
    const r = this.radius;

    if (img) {
      // Wobble rotation for comic flying effect
      const wobble = Math.sin(this.spin) * 0.25;
      ctx.save();
      ctx.rotate(wobble);
      // circular clip
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      if (iw && ih) {
        const scale = Math.max((r * 2) / iw, (r * 2) / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      }
      ctx.restore();
      // colored ring
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = this.isSpecial ? 5 : 3;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      // Fallback cartoon body
      ctx.scale(this.facing, 1);
      ctx.fillStyle = c.primary;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      this.drawFace(ctx, c);
    }

    // Hit flash overlay
    if (this.hitFlash > 0) {
      ctx.globalAlpha = this.hitFlash * 0.7;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  private drawFace(ctx: CanvasRenderingContext2D, c: { primary: string; secondary: string; accent: string }) {
    if (this.kind === 'puneet') {
      // Wild hair
      ctx.fillStyle = '#1a1a1a';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 8, -this.radius * 0.7);
        ctx.lineTo(i * 8 + 4, -this.radius - 8);
        ctx.lineTo(i * 8 + 8, -this.radius * 0.7);
        ctx.fill();
      }
      // Eyes wide
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-7, -4, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(7, -4, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(-7, -4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(7, -4, 3, 0, Math.PI * 2); ctx.fill();
      // Open shocked mouth
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath(); ctx.ellipse(0, 10, 6, 9, 0, 0, Math.PI * 2); ctx.fill();
      // Expression marks
      ctx.strokeStyle = c.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-14, 8); ctx.lineTo(-20, 12); ctx.stroke();
    } else if (this.kind === 'rakhi') {
      // Glam hair
      ctx.fillStyle = '#3a1a5c';
      ctx.beginPath();
      ctx.ellipse(0, -this.radius * 0.5, this.radius * 0.9, this.radius * 0.6, 0, Math.PI, 0);
      ctx.fill();
      // Big eyes with lashes
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(-7, -3, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(7, -3, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(-7, -3, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(7, -3, 3, 0, Math.PI * 2); ctx.fill();
      // Lashes
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-12, -8); ctx.lineTo(-14, -11); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, -8); ctx.lineTo(14, -11); ctx.stroke();
      // Lipstick lips
      ctx.fillStyle = '#e11d48';
      ctx.beginPath(); ctx.ellipse(0, 10, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
      // Earrings
      ctx.fillStyle = c.accent;
      ctx.beginPath(); ctx.arc(-this.radius * 0.8, 4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(this.radius * 0.8, 4, 3, 0, Math.PI * 2); ctx.fill();
    } else {
      // MC Stan - streetwear hoodie + shades
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(0, -this.radius * 0.4, this.radius, this.radius * 0.7, 0, Math.PI, 0);
      ctx.fill();
      // Cap
      ctx.fillStyle = c.accent;
      ctx.fillRect(-this.radius, -this.radius * 0.6, this.radius * 2, 6);
      // Animated shades
      ctx.fillStyle = '#000';
      ctx.fillRect(-14, -6, 28, 8);
      ctx.fillStyle = c.accent;
      ctx.fillRect(-13, -5, 11, 6);
      ctx.fillRect(2, -5, 11, 6);
      // Gold chain
      ctx.strokeStyle = c.accent; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 14, 8, 0, Math.PI); ctx.stroke();
      // Mouth grill
      ctx.fillStyle = c.accent;
      ctx.fillRect(-6, 8, 12, 4);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
      for (let i = -5; i <= 5; i += 3) {
        ctx.beginPath(); ctx.moveTo(i, 8); ctx.lineTo(i, 12); ctx.stroke();
      }
    }
    if (this.hitFlash > 0) {
      ctx.globalAlpha = this.hitFlash * 0.6;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius, this.radius * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}