# The Fractured Constellation

An offline, bilingual browser RPG by **Khalil Abboud / خليل عبود**. Part I follows Shadow, Astro and Venom from the burning village of Elaris to a voyage toward Valdorn, the capital of the Brotherhood of Dawn.

## Play locally

Download the repository with **Code → Download ZIP**, extract it, and open `index.html` in a modern browser. Keep the `assets` folder beside it. No build step or installation is required. The standalone HTML shared in ChatGPT includes the same music inside one file and is convenient for offline play on a phone.

Choose Arabic or English before starting. Progress is saved automatically at checkpoints from which the party can leave and train. Saves belong to the current browser and device.

## Controls

| Action | Computer | Phone |
| --- | --- | --- |
| Move | Arrow keys | Movement stick |
| Talk, enter buildings, confirm | Z | A |
| Back or cancel | X | B in exploration and utility menus |
| Sprint while moving | Hold X | Hold B |
| Battle commands, targets and shops | Mouse; Z/X and arrows also work in battle | Tap the controls |
| Speed up battle | Hold F or the speed button | Hold the speed button |
| Stop AUTO battle | Z, X, an arrow, or click a non-button area | Tap a non-button area |

AUTO uses normal attacks for the whole party until the battle ends or the player cancels it. Held fast-forward runs combat at **3×** speed and music at **2×** speed; releasing it restores both.

## Part I

- Explore villages, separate building interiors, a forest and an irregular world map with persistent discovery fog.
- Meet companions through story choices, fight regional encounters and commanders, and investigate Bellhaven's arena and its feared Abomination.
- Train, earn gold, buy equipment and remedies, and learn skills during the first ten levels: Astro has seven skills, Shadow four and Venom three.
- Reach the harbor and the fleet finale, with an original epic score and a separate ritual theme for Raymond's throne chamber.

## Development tools

The small gear in the upper-left corner opens a password prompt. It contains stage jumps, party-level controls, gold controls and text shortcuts. The password is requested each time the panel is opened. Development jumps use a separate test checkpoint instead of replacing normal saved progress.

## Editing

`index.html` contains the HTML interface, CSS layout and the JavaScript game. Dialogue pairs are stored together in `D(speaker, english, arabic)` entries, with some opening lines in `AR_TEXT`. Update both languages whenever changing a line. `SKILLS`, `GEAR`, regional enemy tables and boss tuning hold the principal gameplay data.

The web edition loads the original recordings from ordered JavaScript chunks in `assets/audio`. Keep these files and their script tags intact. The audio is identical to the standalone edition; the split allows reliable uploading and static hosting.

**Game created by Khalil Abboud.**  
**صُنعت اللعبة بواسطة خليل عبود.**
