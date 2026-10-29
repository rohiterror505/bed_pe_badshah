import type { Vec2 } from '../types/game';

export class Particle {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity: number;

  constructor(pos: Vec2, vel: Vec2, life: number, color: string, size: number, gravity = 0) {
    this.pos = { ...pos };
    this.vel = { ...vel };
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
    this.gravity = gravity;
  }

  update(dt: number) {
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.vel.y += this.gravity * dt;
    this.life -= dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const a = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size * a, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export class ParticleSystem {
  particles: Particle[] = [];

  burst(pos: Vec2, count: number, colors: string[], speed = 200, life = 0.6, gravity = 0) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const s = speed * (0.4 + Math.random() * 0.8);
      const vel = { x: Math.cos(angle) * s, y: Math.sin(angle) * s };
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 3 + Math.random() * 4;
      const l = life * (0.7 + Math.random() * 0.6);
      this.particles.push(new Particle(pos, vel, l, color, size, gravity));
    }
  }

  smoke(pos: Vec2, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const s = 30 + Math.random() * 60;
      const vel = { x: Math.cos(angle) * s, y: Math.sin(angle) * s - 40 };
      const size = 8 + Math.random() * 10;
      this.particles.push(new Particle(pos, vel, 0.8, 'rgba(200,200,200,0.6)', size, -30));
    }
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(dt);
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) p.draw(ctx);
  }

  clear() {
    this.particles.length = 0;
  }
}