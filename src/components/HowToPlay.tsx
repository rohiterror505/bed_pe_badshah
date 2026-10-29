import { Home } from 'lucide-react';

interface Props {
  onMenu: () => void;
}

export function HowToPlay({ onMenu }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/85 backdrop-blur p-4">
      <div className="bg-zinc-900 border-2 border-electric rounded-xl p-6 w-full max-w-md">
        <h2 className="font-display text-3xl text-electric mb-4">How to Play</h2>
        <ul className="space-y-2 text-sm text-white/90">
          <li>• Move the <strong>mouse</strong> to aim.</li>
          <li>• <strong>Left-click</strong> or <strong>Spacebar</strong> to shoot.</li>
          <li>• On mobile, <strong>tap and drag</strong> to aim &amp; shoot.</li>
          <li>• Hit the flying meme legends to score. <strong>MC Stan = 500 pts!</strong></li>
          <li>• Chain hits to build your <strong>combo multiplier</strong>.</li>
          <li>• Misses reset your combo and trigger enemy taunts.</li>
          <li>• You have <strong>90 seconds</strong>. Make them count.</li>
        </ul>
        <p className="mt-3 text-xs text-white/50">Confirmed kills trigger the Badshah's signature catchphrase. Toggle Adult Humor in Settings to tone it down.</p>
        <button onClick={onMenu} className="mt-5 flex items-center gap-2 bg-neon text-white font-display text-xl px-6 py-2 rounded-lg hover:scale-105 transition">
          <Home size={18} /> Back
        </button>
      </div>
    </div>
  );
}