import { RotateCcw, Home } from 'lucide-react';
import type { FinalResult } from '../types/game';

interface Props {
  result: FinalResult;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export function GameOverScreen({ result, onPlayAgain, onMenu }: Props) {
  const s = result.stats;
  const acc = s.shots > 0 ? Math.round((s.hits / s.shots) * 100) : 0;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/85 backdrop-blur px-4 py-6 overflow-y-auto">
      <h2 className="font-display text-4xl xs:text-5xl sm:text-7xl text-neon drop-shadow-[0_0_15px_rgba(255,23,68,0.7)] text-center">
        {result.isNewBest ? 'NEW RECORD!' : 'GAME OVER'}
      </h2>
      <p className="font-display text-xl xs:text-2xl text-electric mt-2 px-4 text-center">{result.message}</p>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-5 sm:mt-6 w-full max-w-xs sm:w-72 text-center">
        <Box label="FINAL SCORE" value={String(s.score)} />
        <Box label="PERSONAL BEST" value={String(result.personalBest)} />
        <Box label="KILLS" value={String(s.kills)} />
        <Box label="ACCURACY" value={acc + '%'} />
        <Box label="BEST COMBO" value={'x' + s.bestCombo} />
        <Box label="SHOTS" value={String(s.shots)} />
      </div>
      <div className="flex flex-col xs:flex-row gap-3 mt-6">
        <button onClick={onPlayAgain} className="flex items-center justify-center gap-2 bg-electric text-black font-display text-xl px-6 py-3 rounded-lg hover:scale-105 active:scale-95 transition">
          <RotateCcw size={20} /> Play Again
        </button>
        <button onClick={onMenu} className="flex items-center justify-center gap-2 bg-white/10 text-white font-display text-xl px-6 py-3 rounded-lg hover:bg-white/20 active:scale-95 transition border border-white/30">
          <Home size={20} /> Main Menu
        </button>
      </div>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 border border-white/20 rounded-lg py-2">
      <div className="text-[9px] sm:text-[10px] text-white/60 font-display">{label}</div>
      <div className="text-xl sm:text-2xl font-display text-electric">{value}</div>
    </div>
  );
}