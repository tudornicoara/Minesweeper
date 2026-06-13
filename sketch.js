let CANVASWIDTH = 1000;
let CANVASHEIGHT = 1000;
let CELLWIDTH = 40;      // configured/max cell size
let CELLHEIGHT = 40;
let CELLW = 40;          // actual rendered cell size (after fit scaling)
let CELLH = 40;
let CELLSONROW = 20;
let CELLSONCOLUMN = 20;
let BOMBSNUMBER = 100;
let GAMEOVER = false;
let gameoverAt = null;

let cnv = null;
let lastTouch = 0;          // millis() of last touch, to ignore emulated mouse
let touchInfo = null;       // { index, time, x, y, moved, acted }
let longPressTimer = null;

let cells = [];

function setup() {
    extractValues();
    computeFit();
    cnv = createCanvas(CANVASWIDTH, CANVASHEIGHT);
    cnv.parent('canvas-container');
    registerTouch();
    placeCells();
}

// Fit the board into the available container width: shrink cells so the whole
// board fits horizontally (no pinch-zoom on phones); never enlarge past the
// configured size, so wide desktops render at the chosen cell size unchanged.
function computeFit() {
    const container = document.getElementById('canvas-container');
    const avail = (container && container.clientWidth) || window.innerWidth;
    const scale = Math.min(1, avail / (CELLWIDTH * CELLSONROW));
    CELLW = CELLWIDTH * scale;
    CELLH = CELLHEIGHT * scale;
    CANVASWIDTH = CELLW * CELLSONROW;
    CANVASHEIGHT = CELLH * CELLSONCOLUMN;
}

function windowResized() {
    computeFit();
    resizeCanvas(CANVASWIDTH, CANVASHEIGHT);
    repositionCells();
}

function repositionCells() {
    cells.forEach((cell, i) => {
        const col = i % CELLSONROW;
        const row = Math.floor(i / CELLSONROW);
        cell.col = col;
        cell.row = row;
        cell.w = CELLW;
        cell.h = CELLH;
        cell.setPosition(col * CELLW, row * CELLH);
    });
}

function draw() {
    background(THEME.current === 'dark' ? color(25, 25, 45) : color(200, 205, 215));

    if (GAMEOVER && gameoverAt === null) gameoverAt = millis();
    if (!GAMEOVER) gameoverAt = null;

    const won = GAMEOVER && gameWon();
    const elapsed = gameoverAt === null ? 0 : millis() - gameoverAt;
    const progress = gameoverAt === null ? 0 : constrain(elapsed / 350, 0, 1);

    push();
    // Screen shake on loss, decaying over ~400ms.
    if (GAMEOVER && !won) {
        const shake = Math.max(0, 1 - elapsed / 400) * 8;
        translate(random(-shake, shake), random(-shake, shake));
    }
    cells.forEach(cell => cell.show());
    pop();

    if (GAMEOVER) {
        if (won) displayWin(progress);
        else displayLoss(progress);
    }

    updateFlagCount();
    fill(0);
}

// Convert pixel coords to a cell index, or -1 if outside the board.
function cellAt(px, py) {
    const x = Math.floor(px / CELLW);
    const y = Math.floor(py / CELLH);
    if (x >= 0 && x < CELLSONROW && y >= 0 && y < CELLSONCOLUMN) {
        return y * CELLSONROW + x;
    }
    return -1;
}

function flagCell(index) {
    if (GAMEOVER) return;
    const cell = cells[index];
    if (!cell.revealed) cell.flagged = !cell.flagged;
}

function revealCell(index) {
    if (GAMEOVER) return;
    const cell = cells[index];
    if (cell.flagged) return;

    // First reveal generates a board solvable from this cell.
    if (cells.every(c => !c.revealed)) {
        let attempts = 0;
        do {
            do {
                resetCells();
                placeBombs();
                setNeighborNumbers();
            } while (cell.bomb || cell.number !== 0);
            attempts++;
        } while (document.getElementById('noGuessing').checked &&
                 !canSolveWithoutGuessing(index) && attempts < 500);
    }

    if (cell.revealed) {
        pressRevealedCell(cell);
    } else if (cell.bomb) {
        revealAllCells();
        GAMEOVER = true;
    } else {
        cell.revealed = true;
        if (cell.number === 0) revealNeighbors(cell);
    }

    if (gameWon()) GAMEOVER = true;
}

function mousePressed() {
    // Ignore mouse events synthesized from a recent touch.
    if (millis() - lastTouch < 600) return false;

    if (GAMEOVER) {
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

function registerTouch() {
    const el = cnv.elt;
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });
}

// Canvas-relative pixel coords for a Touch, scaled to the drawing buffer.
function touchPos(touch) {
    const r = cnv.elt.getBoundingClientRect();
    return {
        x: (touch.clientX - r.left) * (CANVASWIDTH / r.width),
        y: (touch.clientY - r.top) * (CANVASHEIGHT / r.height),
    };
}

function onTouchStart(event) {
    lastTouch = millis();
    if (event.touches.length !== 1) return;   // ignore multi-touch / pinch

    if (GAMEOVER) {
        resetGame();
        return;
    }

    const p = touchPos(event.touches[0]);
    const index = cellAt(p.x, p.y);
    if (index === -1) return;

    touchInfo = { index, x: p.x, y: p.y, moved: false, acted: false };
    longPressTimer = setTimeout(() => {
        if (touchInfo && !touchInfo.moved && !touchInfo.acted) {
            flagCell(touchInfo.index);
            touchInfo.acted = true;
            if (navigator.vibrate) navigator.vibrate(30);
            if (gameWon()) GAMEOVER = true;
        }
    }, 400);
}

function onTouchMove(event) {
    if (!touchInfo || touchInfo.moved) return;
    const p = touchPos(event.touches[0]);
    if (Math.abs(p.x - touchInfo.x) > 10 || Math.abs(p.y - touchInfo.y) > 10) {
        touchInfo.moved = true;              // it's a scroll, not a tap
        clearTimeout(longPressTimer);
    }
}

function onTouchEnd(event) {
    lastTouch = millis();
    clearTimeout(longPressTimer);
    if (touchInfo && !touchInfo.moved && !touchInfo.acted) {
        revealCell(touchInfo.index);
    }
    touchInfo = null;
}

function updateFlagCount() {
    const el = document.getElementById('flag-count');
    if (!el) return;
    const flagged = cells.filter(c => c.flagged).length;
    el.textContent = `🚩 ${flagged}/${BOMBSNUMBER}`;
}

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
