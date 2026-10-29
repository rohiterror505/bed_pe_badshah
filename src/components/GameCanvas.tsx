import { useEffect } from 'react';
import type { GameEngine } from '../game/GameEngine';

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  engineRef: React.MutableRefObject<GameEngine | null>;
  paused: boolean;
}

export function GameCanvas({ canvasRef, engineRef, paused }: Props) {
  useEffect(() => {
    const onResize = () => engineRef.current?.resize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [engineRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      engineRef.current?.setAiming(e.clientX - rect.left, e.clientY - rect.top);
    };
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      engineRef.current?.shoot();
    };
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      if (t) {
        engineRef.current?.setAiming(t.clientX - rect.left, t.clientY - rect.top);
        if (e.type === 'touchstart') engineRef.current?.shoot();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        engineRef.current?.shoot();
      }
    };
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    window.addEventListener('keydown', handleKey);
    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('keydown', handleKey);
    };
  }, [engineRef, canvasRef]);

  useEffect(() => {
    if (paused) engineRef.current?.pause();
    else engineRef.current?.resume();
  }, [paused, engineRef]);

  return (
    <canvas
      ref={canvasRef as React.RefObject<HTMLCanvasElement>}
      className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
    />
  );
}