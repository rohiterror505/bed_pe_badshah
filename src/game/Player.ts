import type { Vec2 } from '../types/game';
import type { ImageCache } from './ImageCache';

export class Player {
  pos: Vec2;
  fireOrigin: Vec2;
  width = 320;
  height = 110;
  recoil = 0;
  flash = 0;
  shakeOffset = 0;
  private images: ImageCache | null;
  private bob = 0;

  constructor(centerX: number, centerY: number, images: ImageCache | null = null) {
    this.pos = { x: centerX, y: centerY };
    // Crotch = center of the lying body
    this.fireOrigin = { x: centerX, y: centerY - 8 };
    this.images = images;
  }

  update(dt: number) {
    this.recoil = Math.max(0, this.recoil - dt * 4);
    this.flash = Math.max(0, this.flash - dt * 5);
    this.shakeOffset = Math.sin(performance.now() / 30) * this.recoil * 4;
    this.bob += dt * 2;
  }

  getMuzzle(): Vec2 {
    return { x: this.fireOrigin.x, y: this.fireOrigin.y - this.recoil * 6 };
  }

  fire(dir: Vec2): Vec2 {
    this.recoil = 1;
    this.flash = 1;
    const m = this.getMuzzle();
    return { ...m };
  }

  draw(ctx: CanvasRenderingContext2D) {
    const px = this.pos.x;
    const py = this.pos.y;
    const w = this.width;
    const left = px - w / 2;
    const right = px + w / 2;
    const bedTop = py + 18;

    ctx.save();
    ctx.translate(this.shakeOffset, 0);

    // ---- Bed frame (wooden) ----
    const frameH = 46;
    ctx.fillStyle = '#5b2a0c';
    ctx.beginPath();
    ctx.roundRect(left - 50, bedTop, w + 100, frameH, 10);
    ctx.fill();
    // wood highlight
    ctx.fillStyle = '#7a3d15';
    ctx.fillRect(left - 50, bedTop, w + 100, 8);
    // bed posts
    ctx.fillStyle = '#3d1a07';
    ctx.fillRect(left - 50, bedTop - 14, 16, frameH + 14);
    ctx.fillRect(right + 34, bedTop - 14, 16, frameH + 14);

    // ---- Mattress ----
    ctx.fillStyle = '#f3e8ff';
    ctx.beginPath();
    ctx.roundRect(left - 34, bedTop - 6, w + 68, 22, 8);
    ctx.fill();
    // mattress seam line
    ctx.strokeStyle = '#d8b4fe';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left - 30, bedTop + 4); ctx.lineTo(right + 30, bedTop + 4);
    ctx.stroke();

    // ---- Pillow (left, under head) ----
    const pillowX = left + 4;
    const pillowY = bedTop - 10;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(pillowX, pillowY, 44, 26, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e9d5ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ---- Head (real photo) on pillow ----
    const headR = 38;
    const headX = pillowX + 6;
    const headY = pillowY - 6;
    const img = this.images?.get('amitabh') ?? null;
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(headX, headY, headR, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      if (iw && ih) {
        const scale = Math.max((headR * 2) / iw, (headR * 2) / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        ctx.drawImage(img, headX - dw / 2, headY - dh / 2, dw, dh);
      }
      ctx.restore();
      // golden ring
      ctx.strokeStyle = '#ffea00';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(headX, headY, headR, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#e8b27a';
      ctx.beginPath(); ctx.arc(headX, headY, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(headX, headY - 8, 24, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.fillRect(headX - 14, headY - 2, 28, 7);
    }

    // ---- Torso under blanket ----
    const torsoLeft = headX + headR - 4;
    const torsoRight = right - 30;
    const blanketTop = py - 6;
    const blanketH = 34;
    // blanket body (Bollywood royal purple with gold trim)
    const bg = ctx.createLinearGradient(0, blanketTop, 0, blanketTop + blanketH);
    bg.addColorStop(0, '#7c3aed');
    bg.addColorStop(1, '#4c1d95');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(torsoLeft, blanketTop, torsoRight - torsoLeft, blanketH, 12);
    ctx.fill();
    // gold trim
    ctx.strokeStyle = '#ffea00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(torsoLeft, blanketTop, torsoRight - torsoLeft, blanketH, 12);
    ctx.stroke();
    // diamond pattern
    ctx.fillStyle = 'rgba(255,234,0,0.5)';
    for (let i = 0; i < 5; i++) {
      const dx = torsoLeft + 26 + i * 40;
      if (dx > torsoRight - 10) break;
      ctx.beginPath();
      ctx.moveTo(dx, blanketTop + 6);
      ctx.lineTo(dx + 8, blanketTop + blanketH / 2);
      ctx.lineTo(dx, blanketTop + blanketH - 6);
      ctx.lineTo(dx - 8, blanketTop + blanketH / 2);
      ctx.closePath();
      ctx.fill();
    }

    // ---- Chest bump (torso rise near head) ----
    ctx.fillStyle = '#5b21b6';
    ctx.beginPath();
    ctx.ellipse(torsoLeft + 22, blanketTop + 4, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // ---- Crotch bump (center) where firing originates ----
    const crotchX = this.fireOrigin.x;
    const crotchY = this.fireOrigin.y + 4;
    ctx.fillStyle = '#4c1d95';
    ctx.beginPath();
    ctx.ellipse(crotchX, crotchY, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffea00';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ---- Legs under blanket tapering to feet ----
    ctx.fillStyle = '#4c1d95';
    ctx.beginPath();
    ctx.moveTo(crotchX + 12, blanketTop + 4);
    ctx.lineTo(right - 14, blanketTop + 10);
    ctx.lineTo(right - 14, blanketTop + blanketH - 2);
    ctx.lineTo(crotchX + 12, blanketTop + blanketH - 2);
    ctx.closePath();
    ctx.fill();

    // ---- Feet sticking out ----
    ctx.fillStyle = '#e8b27a';
    ctx.beginPath();
    ctx.ellipse(right - 6, blanketTop + blanketH - 4, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(right - 22, blanketTop + blanketH - 4, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // ---- Muzzle flash at crotch ----
    const m = this.getMuzzle();
    if (this.flash > 0) {
      ctx.globalAlpha = this.flash;
      ctx.fillStyle = '#ffea00';
      ctx.shadowColor = '#ffea00';
      ctx.shadowBlur = 36;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 22 * this.flash, 0, Math.PI * 2);
      ctx.fill();
      // star burst
      ctx.strokeStyle = '#fff7a0';
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(m.x + Math.cos(a) * 14, m.y + Math.sin(a) * 14);
        ctx.lineTo(m.x + Math.cos(a) * (26 + 8 * this.flash), m.y + Math.sin(a) * (26 + 8 * this.flash));
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
}