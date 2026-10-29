import type { Projectile } from './Projectile';

export class CollisionSystem {
  static circleHit(
    ax: number, ay: number, ar: number,
    bx: number, by: number, br: number
  ): boolean {
    const dx = ax - bx;
    const dy = ay - by;
    const r = ar + br;
    return dx * dx + dy * dy <= r * r;
  }

  static projectileHitsRect(
    p: Projectile, rx: number, ry: number, rw: number, rh: number
  ): boolean {
    const cx = Math.max(rx, Math.min(p.pos.x, rx + rw));
    const cy = Math.max(ry, Math.min(p.pos.y, ry + rh));
    const dx = p.pos.x - cx;
    const dy = p.pos.y - cy;
    return dx * dx + dy * dy <= p.radius * p.radius;
  }
}