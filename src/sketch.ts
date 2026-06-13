import { state } from './state';
import { THEME } from './theme';
import { placeCells, placeBombs, setNeighborNumbers, resetCells, canSolveWithoutGuessing } from './grid';
import {
  gameWon,
  revealAllCells,
  revealNeighbors,
  pressRevealedCell,
  displayWin,
  displayLoss,
  resetGame,
  extractValues,
} from './game';

export function setup(): void {
  extractValues();
  computeFit();
  state.cnv = createCanvas(state.CANVASWIDTH, state.CANVASHEIGHT);
  state.cnv.parent('canvas-container');
  registerTouch();
  placeCells();
}

// Fit the board into the available container width: shrink cells so the whole
// board fits horizontally (no pinch-zoom on phones); never enlarge past the
// configured size, so wide desktops render at the chosen cell size unchanged.
export function computeFit(): void {
  const container = document.getElementById('canvas-container');
  const avail = (container && container.clientWidth) || window.innerWidth;
  const scale = Math.min(1, avail / (state.CELLWIDTH * state.CELLSONROW));
  state.CELLW = state.CELLWIDTH * scale;
  state.CELLH = state.CELLHEIGHT * scale;
  state.CANVASWIDTH = state.CELLW * state.CELLSONROW;
  state.CANVASHEIGHT = state.CELLH * state.CELLSONCOLUMN;
}

export function windowResized(): void {
  computeFit();
  resizeCanvas(state.CANVASWIDTH, state.CANVASHEIGHT);
  repositionCells();
}

function repositionCells(): void {
  state.cells.forEach((cell, i) => {
    const col = i % state.CELLSONROW;
    const row = Math.floor(i / state.CELLSONROW);
    cell.col = col;
    cell.row = row;
    cell.w = state.CELLW;
    cell.h = state.CELLH;
    cell.setPosition(col * state.CELLW, row * state.CELLH);
  });
}

export function draw(): void {
  background(THEME.current === 'dark' ? color(25, 25, 45) : color(200, 205, 215));

  if (state.GAMEOVER && state.gameoverAt === null) state.gameoverAt = millis();
  if (!state.GAMEOVER) state.gameoverAt = null;

  const won = state.GAMEOVER && gameWon();
  const elapsed = state.gameoverAt === null ? 0 : millis() - state.gameoverAt;
  const progress = state.gameoverAt === null ? 0 : constrain(elapsed / 350, 0, 1);

  push();
  // Screen shake on loss, decaying over ~400ms.
  if (state.GAMEOVER && !won) {
    const shake = Math.max(0, 1 - elapsed / 400) * 8;
    translate(random(-shake, shake), random(-shake, shake));
  }
  state.cells.forEach((cell) => cell.show());
  pop();

  if (state.GAMEOVER) {
    if (won) displayWin(progress);
    else displayLoss(progress);
  }

  updateFlagCount();
  fill(0);
}

// Convert pixel coords to a cell index, or -1 if outside the board.
function cellAt(px: number, py: number): number {
  const x = Math.floor(px / state.CELLW);
  const y = Math.floor(py / state.CELLH);
  if (x >= 0 && x < state.CELLSONROW && y >= 0 && y < state.CELLSONCOLUMN) {
    return y * state.CELLSONROW + x;
  }
  return -1;
}

function flagCell(index: number): void {
  if (state.GAMEOVER) return;
  const cell = state.cells[index];
  if (!cell.revealed) cell.flagged = !cell.flagged;
}

function revealCell(index: number): void {
  if (state.GAMEOVER) return;
  const cell = state.cells[index];
  if (cell.flagged) return;

  // First reveal generates a board solvable from this cell.
  if (state.cells.every((c) => !c.revealed)) {
    let attempts = 0;
    const noGuessing = document.getElementById('noGuessing') as HTMLInputElement;
    do {
      do {
        resetCells();
        placeBombs();
        setNeighborNumbers();
      } while (cell.bomb || cell.number !== 0);
      attempts++;
    } while (noGuessing.checked && !canSolveWithoutGuessing(index) && attempts < 500);
  }

  if (cell.revealed) {
    pressRevealedCell(cell);
  } else if (cell.bomb) {
    revealAllCells();
    state.GAMEOVER = true;
  } else {
    cell.revealed = true;
    if (cell.number === 0) revealNeighbors(cell);
  }

  if (gameWon()) state.GAMEOVER = true;
}

export function mousePressed(): boolean | void {
  // Ignore mouse events synthesized from a recent touch.
  if (millis() - state.lastTouch < 600) return false;

  if (state.GAMEOVER) {
    resetGame();
    return;
  }

  const index = cellAt(mouseX, mouseY);
  if (index === -1) return;

  if (mouseButton === RIGHT) flagCell(index);
  else if (mouseButton === LEFT) revealCell(index);
}

// ---- Touch input -----------------------------------------------------------
// Tap reveals; hold 400ms flags. We attach NATIVE touch listeners to the canvas
// rather than defining p5's touchStarted/touchMoved/touchEnded — defining those
// makes p5 set an internal `touchstart` flag that permanently swallows mouse
// clicks (p5's _onmousedown early-returns on it without ever resetting it).
// touch-action: pan-y (CSS) keeps vertical scrolling on tall boards; we never
// preventDefault, so the browser still scrolls. The synthesized mouse event that
// follows a tap is ignored by mousePressed via the lastTouch guard.

function registerTouch(): void {
  const el = state.cnv!.elt as HTMLCanvasElement;
  el.addEventListener('touchstart', onTouchStart, { passive: true });
  el.addEventListener('touchmove', onTouchMove, { passive: true });
  el.addEventListener('touchend', onTouchEnd, { passive: true });
  el.addEventListener('touchcancel', onTouchEnd, { passive: true });
}

// Canvas-relative pixel coords for a Touch, scaled to the drawing buffer.
function touchPos(touch: Touch): { x: number; y: number } {
  const r = (state.cnv!.elt as HTMLCanvasElement).getBoundingClientRect();
  return {
    x: (touch.clientX - r.left) * (state.CANVASWIDTH / r.width),
    y: (touch.clientY - r.top) * (state.CANVASHEIGHT / r.height),
  };
}

function onTouchStart(event: TouchEvent): void {
  state.lastTouch = millis();
  if (event.touches.length !== 1) return; // ignore multi-touch / pinch

  if (state.GAMEOVER) {
    resetGame();
    return;
  }

  const p = touchPos(event.touches[0]);
  const index = cellAt(p.x, p.y);
  if (index === -1) return;

  state.touchInfo = { index, x: p.x, y: p.y, moved: false, acted: false };
  state.longPressTimer = window.setTimeout(() => {
    const info = state.touchInfo;
    if (info && !info.moved && !info.acted) {
      flagCell(info.index);
      info.acted = true;
      if (navigator.vibrate) navigator.vibrate(30);
      if (gameWon()) state.GAMEOVER = true;
    }
  }, 400);
}

function onTouchMove(event: TouchEvent): void {
  if (!state.touchInfo || state.touchInfo.moved) return;
  const p = touchPos(event.touches[0]);
  if (Math.abs(p.x - state.touchInfo.x) > 10 || Math.abs(p.y - state.touchInfo.y) > 10) {
    state.touchInfo.moved = true; // it's a scroll, not a tap
    if (state.longPressTimer !== null) clearTimeout(state.longPressTimer);
  }
}

function onTouchEnd(): void {
  state.lastTouch = millis();
  if (state.longPressTimer !== null) clearTimeout(state.longPressTimer);
  if (state.touchInfo && !state.touchInfo.moved && !state.touchInfo.acted) {
    revealCell(state.touchInfo.index);
  }
  state.touchInfo = null;
}

function updateFlagCount(): void {
  const el = document.getElementById('flag-count');
  if (!el) return;
  const flagged = state.cells.filter((c) => c.flagged).length;
  el.textContent = `🚩 ${flagged}/${state.BOMBSNUMBER}`;
}

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});
