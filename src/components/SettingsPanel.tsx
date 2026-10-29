import { X } from 'lucide-react';
import type { Settings, Difficulty, EnemyKind } from '../types/game';

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onChange, onClose }: Props) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  const setChar = (k: EnemyKind, v: boolean) =>
    set({ characterToggles: { ...settings.characterToggles, [k]: v } });

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/80 backdrop-blur p-4">
      <div className="bg-zinc-900 border-2 border-purpleg rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-3xl text-electric">Settings</h2>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 rounded-lg p-2"><X size={20} /></button>
        </div>

        <Slider label="Master Volume" value={settings.masterVolume} onChange={(v) => set({ masterVolume: v })} />
        <Slider label="Music Volume" value={settings.musicVolume} onChange={(v) => set({ musicVolume: v })} />
        <Slider label="SFX Volume" value={settings.sfxVolume} onChange={(v) => set({ sfxVolume: v })} />
        <Slider label="Dialogue Volume" value={settings.dialogueVolume} onChange={(v) => set({ dialogueVolume: v })} />

        <div className="mt-4">
          <div className="font-display text-lg text-white mb-1">Difficulty</div>
          <div className="flex gap-2">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => set({ difficulty: d })}
                className={`flex-1 py-2 rounded-lg font-display capitalize ${settings.difficulty === d ? 'bg-neon text-white' : 'bg-white/10 text-white'}`}
              >{d}</button>
            ))}
          </div>
        </div>

        <Toggle label="Adult Humor Mode" value={settings.adultHumor} onChange={(v) => set({ adultHumor: v })} />
        <Toggle label="Reduced Screen Shake" value={settings.reducedShake} onChange={(v) => set({ reducedShake: v })} />
        <Toggle label="Mute All" value={settings.muted} onChange={(v) => set({ muted: v })} />

        <div className="mt-4">
          <div className="font-display text-lg text-white mb-1">Character Dialogue</div>
          <Toggle label="Rakhi Sawant" value={settings.characterToggles.rakhi} onChange={(v) => setChar('rakhi', v)} />
          <Toggle label="MC Stan" value={settings.characterToggles.mcstan} onChange={(v) => setChar('mcstan', v)} />
        </div>

        <div className="mt-4 text-xs text-white/50 bg-white/5 rounded p-3">
          <strong>Audio Assets:</strong> Place files under <code>public/audio/</code> per the README.
          Missing files fall back silently. MP3, WAV, and OGG are supported.
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm"><span>{label}</span><span>{Math.round(value * 100)}%</span></div>
      <input type="range" min={0} max={1} step={0.01} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-fuchsia-500" />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center justify-between w-full py-2 text-sm">
      <span>{label}</span>
      <span className={`w-12 h-6 rounded-full p-0.5 transition ${value ? 'bg-neon' : 'bg-white/20'}`}>
        <span className={`block w-5 h-5 bg-white rounded-full transition ${value ? 'translate-x-6' : ''}`} />
      </span>
    </button>
  );
}