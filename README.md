# BED PE BADSHAH

> Ek Bed. Teen Legends. Unlimited Bakchodi.

A chaotic, browser-based 2D arcade shooting game — a ridiculous Bollywood
parody bedroom transformed into an action scene. The Badshah lies on an
oversized bed and fires cartoon projectiles at three flying meme legends.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- HTML5 Canvas
- Web Audio API (with Web Speech API fallback possible)
- Lucide icons

## Getting Started

```bash
npm install
npm run dev      # start dev server (http://localhost:5173)
npm run build    # production build (type-checks + bundles to dist/)
npm run preview  # preview the production build
npm run typecheck
```

## How to Play

- Move the **mouse** to aim.
- **Left-click** or **Spacebar** to fire.
- On mobile, **tap and drag** to aim and shoot.
- Round length: **90 seconds**.
- Normal enemy kill: **+100 pts**. MC Stan special: **+500 pts**.
- Chain hits to grow your combo multiplier. Misses reset it.
- Confirmed kills trigger the Badshah's signature catchphrase
  (toggle **Adult Humor Mode** in Settings to tone it down).

## Enemies

- **Puneet Superstar** — wild dodges, dramatic reactions.
- **Rakhi Sawant** — fast, theatrical, glamorous.
- **MC Stan** — rare special rapper with bass-heavy entrance and
  the signature taunt **"TERI MAA KI!"**. Worth 500 points.

## Audio Assets

Place files under `public/audio/` per the structure in
`public/audio/README.txt`. Missing files are handled gracefully
(silent fallback). MP3, WAV, and OGG are supported.

> Use only authorized or original parody recordings. Do not scrape or
> clone real celebrity voices without proper authorization.

## Settings (persisted in localStorage)

- Master / Music / SFX / Dialogue volume
- Per-character dialogue toggles
- Adult-humor mode
- Difficulty (Easy / Normal / Hard)
- Reduced screen shake
- Mute all

The personal best score is also persisted in localStorage.

## Project Structure

```
src/
  components/    GameCanvas, GameHUD, MainMenu, GameOverScreen,
                 SettingsPanel, HowToPlay, DialogueBubble
  game/          GameEngine, Player, Enemy, Projectile,
                 CollisionSystem, ParticleSystem, SpawnManager, ScoreManager
  audio/         AudioManager, DialogueManager, audioConfig
  data/          characterDialogues
  hooks/         useGame
  types/         game
  App.tsx, main.tsx, index.css
```

The game simulation runs inside a single `requestAnimationFrame` loop on
the canvas (delta-time based), keeping rapidly-changing state out of
React renders. React only renders UI overlays (menus, HUD, settings,
game over) and receives periodic stat snapshots via callbacks.