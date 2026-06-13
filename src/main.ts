import { setup, draw, windowResized, mousePressed } from './sketch';
import { resetGame, hint, revealAllBombs, revealAllCells, win } from './game';
import { toggleTheme, stepField, initTheme, openSheet, closeSheet } from './theme';

// p5 runs in global mode and reads these lifecycle hooks off `window`.
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.mousePressed = mousePressed;

// Inline HTML onclick handlers.
window.resetGame = resetGame;
window.hint = hint;
window.revealAllBombs = revealAllBombs;
window.revealAllCells = revealAllCells;
window.win = win;
window.toggleTheme = toggleTheme;
window.stepField = stepField;
window.initTheme = initTheme;
window.openSheet = openSheet;
window.closeSheet = closeSheet;

document.addEventListener('DOMContentLoaded', initTheme);
