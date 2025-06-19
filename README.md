# Minesweeper (p5.js)

A simple Minesweeper game implemented in JavaScript using the [p5.js](https://p5js.org/) library.

## Features

- Adjustable grid size, cell size, and number of bombs via UI controls
- Left-click to reveal cells, right-click to flag bombs
- Win and loss detection with visual feedback
- Hint, reveal, and cheat buttons for gameplay assistance
- Responsive canvas and clean UI

## Getting Started

1. **Clone or download this repository.**
2. **Open `index.html` in your web browser.**

No build step or server is required.

## Controls

- **Left-click:** Reveal a cell
- **Right-click:** Flag or unflag a cell
- **Reveal:** Reveal all cells
- **Reset:** Start a new game with current settings
- **Hint:** Flag a random bomb with at least one revealed neighbor
- **Cheat:** Flag all bombs
- **Win:** Instantly win the game

## Customization

Adjust the following parameters using the input fields below the canvas:

- Canvas Width / Height
- Cell Width / Height
- Cells on Row / Column
- Bombs Number

Click **Reset** after changing values to apply them.

## Dependencies

- [p5.js](https://p5js.org/) (loaded via CDN)

## License

MIT License
