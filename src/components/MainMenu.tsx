import { Play, HelpCircle, Settings, Volume2, VolumeX } from 'lucide-react';

interface Props {
  onStart: () => void;
  onHowTo: () => void;
  onSettings: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export function MainMenu({ onStart, onHowTo, onSettings, muted, onToggleMute }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-gradient-to-b from-purple-900 via-fuchsia-900 to-black px-4 py-8 overflow-y-auto">
      <h1 className="font-display text-4xl xs:text-5xl sm:text-8xl text-electric drop-shadow-[0_0_20px_rgba(255,234,0,0.6)] tracking-wider text-center">
        BED PE BADSHAH
      </h1>
      <p className="font-display text-base xs:text-xl sm:text-2xl text-purpleg mt-2 text-center px-4">
        Ek Bed. Teen Legends. Unlimited Bakchodi.
      </p>
      <div className="flex flex-col gap-3 mt-6 sm:mt-8 w-full max-w-xs sm:w-64">
        <Btn onClick={onStart} icon={<Play size={20} />}>Start Game</Btn>
        <Btn onClick={onHowTo} icon={<HelpCircle size={20} />}>How to Play</Btn>
        <Btn onClick={onSettings} icon={<Settings size={20} />}>Settings</Btn>
        <Btn onClick={onToggleMute} icon={muted ? <VolumeX size={20} /> : <Volume2 size={20} />}>
          Sound {muted ? 'Off' : 'On'}
        </Btn>
      </div>
    </div>
  );
}

function Btn({ children, onClick, icon }: { children: React.ReactNode; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 bg-neon hover:bg-red-500 active:scale-95 text-white font-display text-lg sm:text-xl py-3.5 rounded-lg transition border-2 border-electric shadow-lg"
    >
      {icon}
      {children}
    </button>
  );
}