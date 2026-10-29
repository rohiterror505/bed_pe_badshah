import { useGame } from './hooks/useGame';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { GameOverScreen } from './components/GameOverScreen';
import { SettingsPanel } from './components/SettingsPanel';
import { HowToPlay } from './components/HowToPlay';
import { Play } from 'lucide-react';

export default function App() {
  const g = useGame();
  const inGame = g.phase === 'playing' || g.phase === 'paused' || g.phase === 'countdown';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {(inGame || g.phase === 'gameover') && (
        <GameCanvas canvasRef={g.canvasRef} engineRef={g.engineRef} paused={g.paused} />
      )}

      {inGame && (
        <GameHUD
          stats={g.stats}
          audioOn={!g.settings.muted}
          muted={g.settings.muted}
          onTogglePause={g.togglePause}
          onToggleMute={g.toggleMute}
        />
      )}

      {g.phase === 'paused' && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70 backdrop-blur">
          <h2 className="font-display text-6xl text-electric mb-6">PAUSED</h2>
          <button onClick={g.togglePause} className="flex items-center gap-2 bg-neon text-white font-display text-2xl px-8 py-3 rounded-lg hover:scale-105 transition">
            <Play size={22} /> Resume
          </button>
          <button onClick={g.goMenu} className="mt-3 text-white/70 hover:text-white font-display text-xl">Quit to Menu</button>
        </div>
      )}

      {g.phase === 'menu' && (
        <MainMenu
          onStart={g.startGame}
          onHowTo={() => g.setPhase('howto')}
          onSettings={() => g.setPhase('settings')}
          muted={g.settings.muted}
          onToggleMute={g.toggleMute}
        />
      )}

      {g.phase === 'howto' && <HowToPlay onMenu={g.goMenu} />}

      {g.phase === 'settings' && (
        <SettingsPanel settings={g.settings} onChange={g.setSettings} onClose={() => g.setPhase('menu')} />
      )}

      {g.phase === 'gameover' && g.result && (
        <GameOverScreen result={g.result} onPlayAgain={g.startGame} onMenu={g.goMenu} />
      )}
    </div>
  );
}