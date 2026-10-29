import type { Vec2 } from '../types/game';

export class Projectile {
  pos: Vec2;
  vel: Vec2;
  radius: number;
  alive = true;
  trail: Vec2[] = [];
  life = 2.0;

  constructor(start: Vec2, dir: Vec2, speed: number) {
    this.pos = { ...start };
    this.vel = { x: dir.x * speed, y: dir.y * speed };
    this.radius = 8;
  }

  update(dt: number, width: number, height: number) {
    this.trail.push({ ...this.pos });
    if (this.trail.length > 8) this.trail.shift();
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.life -= dt;
    if (this.pos.x < -20 || this.pos.x > width + 20 || this.pos.y < -20 || this.pos.y > height + 20 || this.life <= 0) {
      this.alive = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const a = (i / this.trail.length) * 0.5;
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.radius * (i / this.trail.length), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffea00';
    ctx.shadowColor = '#ffea00';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}