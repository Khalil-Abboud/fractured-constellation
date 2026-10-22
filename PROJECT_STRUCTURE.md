# Project structure

The game is intentionally built without a bundler so GitHub Pages can run it directly.
Files are loaded in the order shown in `index.html`; keep that order because later systems extend earlier ones.

## Entry point

- `index.html` — HTML screens, menus, canvas, and ordered CSS/JavaScript imports.

## Styles

- `styles/base.css` — page layout, title, dialogue, exploration HUD, joystick, common screens.
- `styles/battle.css` — battle menus, party cards, mobile battle buttons, ending screen.
- `styles/developer.css` — hidden developer access and password panel.
- `styles/desktop.css` — desktop/fullscreen scaling rules.
- `styles/audio.css` — global game volume panel.
- `styles/interface-polish.css` — enemy HP cards, active hero state, statistics, mobile polish.

## Game scripts

- `scripts/audio-data.js` — initializes the audio fragment container.
- `scripts/core.js` — shared state, translations, drawing helpers, prologue, Elaris chapter.
- `scripts/journey.js` — party journey, inventory, equipment, shops, extended adventure systems.
- `scripts/asterford.js` — Asterford, world map, checkpoints, regional content.
- `scripts/eastern-march.js` — Eastern March, Bellhaven, harbor, Part I story data.
- `scripts/battle.js` — skills, effects, encounters, bosses, combat balance.
- `scripts/finale.js` — finale scenes and finale music behavior.
- `scripts/battle-controls.js` — auto battle, fast playback, defeat recovery.
- `scripts/developer-tools.js` — password-protected testing tools.
- `scripts/audio-settings.js` — one volume control for music, dialogue sounds, and effects.
- `scripts/interface-input.js` — responsive UI, statistics, joystick, buttons, startup.

## Audio assets

- `assets/audio/` — split encoded audio fragments loaded before the game scripts.

## Editing guide

1. Story and map changes belong in the chapter file for that location.
2. Combat formulas, enemies, skills, and boss tuning belong in `scripts/battle.js`.
3. Touch/keyboard behavior belongs in `scripts/interface-input.js` or `scripts/battle-controls.js`.
4. Visual changes belong in the matching file under `styles/`.
5. Add new script tags before `scripts/interface-input.js`, because that file starts the game.
