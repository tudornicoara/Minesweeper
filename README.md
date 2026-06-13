# Minesweeper (p5.js)

A Minesweeper game built with TypeScript and [p5.js](https://p5js.org/), bundled with Vite.

## Features

- Light/dark mode — toggleable, persists via `localStorage`, respects `prefers-color-scheme`
- No-guessing mode — board generated to be solvable without guessing
- Mobile support — bottom nav bar with quick actions; settings open as a bottom sheet
- Adjustable columns, rows, cell size, and bomb count
- Left-click to reveal, right-click to flag
- Win/loss detection with confetti on win
- Hint, cheat, reveal all, and auto-win buttons

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

To build for production:

```bash
npm run build
```

## Controls

| Input | Action |
|---|---|
| Left-click | Reveal cell |
| Right-click | Flag / unflag cell |
| Reset (↺) | New game with current settings |
| Hint (💡) | Flag a deducible bomb |
| Cheat (👁) | Flag all bombs |
| Reveal All | Reveal every cell |
| Auto Win | Instantly win |

## Settings

Accessible via the side panel (desktop) or bottom sheet (mobile):

- **Cell Width / Height** — cell size in pixels
- **Columns / Rows** — grid dimensions
- **Bombs** — bomb count
- **No Guessing** — regenerate board until it requires no guessing to solve

## Tech Stack

- TypeScript + p5.js (global mode)
- Vite (dev server + bundler)
- CSS custom properties for theming

## License

MIT License
