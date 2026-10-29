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
    <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between pointer-events-none z-20 font-display">
      <div className="flex gap-4 text-sm sm:text-lg">
        <Stat label="SCORE" value={String(stats.score)} color="text-electric" />
        <Stat label="TIME" value={Math.ceil(stats.timeLeft) + 's'} color="text-neon" />
        <Stat label="COMBO" value={'x' + stats.combo} color="text-purpleg" />
        <Stat label="ACC" value={acc + '%'} color="text-white" />
        <Stat label="KILLS" value={String(stats.kills)} color="text-green-400" />
      </div>
      <div className="flex gap-2 pointer-events-auto">
        <button
          onClick={onTogglePause}
          className="bg-black/60 hover:bg-black/80 border border-white/20 rounded-lg p-2 transition"
          aria-label="Pause"
        >
          <Pause size={18} />
        </button>
        <button
          onClick={onToggleMute}
          className="bg-black/60 hover:bg-black/80 border border-white/20 rounded-lg p-2 transition"
          aria-label="Mute"
        >
          {audioOn && !muted ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center bg-black/40 rounded px-2 py-1 border border-white/10">
      <span className="text-[10px] text-white/60 leading-none">{label}</span>
      <span className={color + ' text-xl leading-tight'}>{value}</span>
    </div>
  );
}