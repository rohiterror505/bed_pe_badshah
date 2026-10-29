import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { GameStats } from '../types/game';

interface Props {
  stats: GameStats;
  audioOn: boolean;
  muted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
}

export function GameHUD({ stats, audioOn, muted, onTogglePause, onToggleMute }: Props) {
  const acc = stats.shots > 0 ? Math.round((stats.hits / stats.shots) * 100) : 0;
  return (
    <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 flex items-start justify-between pointer-events-none z-20 font-display safe-top">
      <div className="flex gap-1 sm:gap-3 text-[10px] sm:text-lg flex-wrap max-w-[70%] sm:max-w-none">
        <Stat label="SCORE" value={String(stats.score)} color="text-electric" />
        <Stat label="TIME" value={Math.ceil(stats.timeLeft) + 's'} color="text-neon" />
        <Stat label="COMBO" value={'x' + stats.combo} color="text-purpleg" />
        <Stat label="KILLS" value={String(stats.kills)} color="text-green-400" />
        <div className="hidden xs:flex flex-col items-center bg-black/40 rounded px-2 py-1 border border-white/10">
          <span className="text-[10px] text-white/60 leading-none">ACC</span>
          <span className="text-white text-base sm:text-xl leading-tight">{acc + '%'}</span>
        </div>
      </div>
      <div className="flex gap-1.5 sm:gap-2 pointer-events-auto">
        <button
          onClick={onTogglePause}
          className="bg-black/60 hover:bg-black/80 border border-white/20 rounded-lg p-2.5 sm:p-2 transition active:scale-90"
          aria-label="Pause"
        >
          <Pause size={20} className="sm:w-[18px] sm:h-[18px]" />
        </button>
        <button
          onClick={onToggleMute}
          className="bg-black/60 hover:bg-black/80 border border-white/20 rounded-lg p-2.5 sm:p-2 transition active:scale-90"
          aria-label="Mute"
        >
          {audioOn && !muted ? <Volume2 size={20} className="sm:w-[18px] sm:h-[18px]" /> : <VolumeX size={20} className="sm:w-[18px] sm:h-[18px]" />}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center bg-black/40 rounded px-1.5 sm:px-2 py-1 border border-white/10">
      <span className="text-[8px] sm:text-[10px] text-white/60 leading-none">{label}</span>
      <span className={color + ' text-base sm:text-xl leading-tight'}>{value}</span>
    </div>
  );
}