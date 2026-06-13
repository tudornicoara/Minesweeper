function revealNeighbors(cell) {
    let neighbors = getNeighbors(cell);
    neighbors.forEach(neighbor => {
        if (!neighbor.revealed && !neighbor.bomb) {
            neighbor.revealed = true;
            if (neighbor.number === 0) {
                revealNeighbors(neighbor);
            }
        }
    });
}

function pressRevealedCell(cell) {
    if (!cell.revealed)
        return;

    let neighbors = getNeighbors(cell);
    let flaggedNeighbors = neighbors.filter(neighbor => neighbor.flagged);
    if (cell.number > 0 && flaggedNeighbors.length === cell.number) {
        neighbors.forEach(neighbor => {
            if (!neighbor.revealed && !neighbor.flagged) {
                if (neighbor.bomb) {
                    revealAllCells();
                    GAMEOVER = true;
                } else {
                    neighbor.revealed = true;
                    if (neighbor.number === 0) {
                        revealNeighbors(neighbor);
                    }
                }
            }
        });
    }
}

function gameWon() {
    return cells.every(cell => cell.bomb || cell.revealed) &&
           !cells.some(cell => cell.bomb && cell.revealed);
}

function win() {
    cells.forEach(cell => {
        if (cell.bomb) {
            cell.flagged = true;
        } else {
            cell.revealed = true;
        }
    });
    GAMEOVER = true;
}

function revealAllCells() {
    cells.forEach(cell => {
        cell.flagged = false;
        cell.revealed = true;
    });
}

function revealAllBombs() {
    cells.forEach(cell => {
        if (cell.bomb) {
            cell.flagged = true;
        }
    });
}

// Deduce one logically-certain move from the CURRENT visible board.
// Returns { index, type } where type is 'safe' (reveal it) or 'mine' (flag it),
// or null when nothing can be proven from what the player can already see.
function getHint() {
    const cellIndexMap = new Map(cells.map((cell, i) => [cell, i]));
    const safe = new Set();
    const mines = new Set();
    const constraints = [];

    cells.forEach((cell, i) => {
        if (!cell.revealed || cell.bomb || cell.number === 0) return;

        const neighbors = getNeighbors(cell);
        const hidden = [];
        let flaggedCount = 0;

        neighbors.forEach(nb => {
            const ni = cellIndexMap.get(nb);
            if (nb.flagged) flaggedCount++;
            else if (!nb.revealed) hidden.push(ni);
        });

        if (hidden.length === 0) return;
        const remaining = cell.number - flaggedCount;

        if (remaining === 0) hidden.forEach(ni => safe.add(ni));
        else if (remaining === hidden.length) hidden.forEach(ni => mines.add(ni));
        else constraints.push({ indices: hidden, count: remaining });
    });

    // Subset rule: if constraint A is contained in B, the difference is decidable.
    for (let a = 0; a < constraints.length; a++) {
        for (let b = 0; b < constraints.length; b++) {
            if (a === b) continue;
            const ca = constraints[a], cb = constraints[b];
            if (ca.indices.length >= cb.indices.length) continue;
            if (!ca.indices.every(i => cb.indices.includes(i))) continue;

            const diff = cb.indices.filter(i => !ca.indices.includes(i));
            const diffCount = cb.count - ca.count;

            if (diffCount === 0) diff.forEach(ni => safe.add(ni));
            else if (diffCount === diff.length) diff.forEach(ni => mines.add(ni));
        }
    }

    // Prefer revealing a proven-safe cell (most useful, least cheaty).
    for (const ni of safe) {
        if (!cells[ni].revealed && !cells[ni].flagged) return { index: ni, type: 'safe' };
    }
    for (const ni of mines) {
        if (!cells[ni].flagged) return { index: ni, type: 'mine' };
    }
    return null;
}

function hint() {
    if (GAMEOVER) return;

    // No board state yet: open a random safe (non-bomb) cell to start.
    if (cells.every(cell => !cell.revealed)) {
        const safeCells = cells.filter(cell => !cell.bomb);
        if (safeCells.length > 0) {
            const c = random(safeCells);
            c.revealed = true;
            if (c.number === 0) revealNeighbors(c);
        }
        return;
    }

    const move = getHint();
    if (move) {
        const cell = cells[move.index];
        if (move.type === 'safe') {
            cell.revealed = true;
            if (cell.number === 0) revealNeighbors(cell);
        } else {
            cell.flagged = true;
        }
    } else {
        // Nothing provable from the visible board: as a last resort flag a
        // frontier bomb so the player still gets unstuck.
        const frontier = cells.filter(
            cell => cell.bomb && !cell.flagged && !cell.revealed && hasRevealedNeighbors(cell)
        );
        if (frontier.length > 0) random(frontier).flagged = true;
    }

    if (gameWon()) GAMEOVER = true;
}

function hasRevealedNeighbors(cell) {
    let neighbors = getNeighbors(cell);
    return neighbors.some(neighbor => neighbor.revealed);
}

function extractValues() {
    CELLWIDTH = parseInt(document.getElementById('cellWidth').value, 10);
    CELLHEIGHT = parseInt(document.getElementById('cellHeight').value, 10);
    CELLSONROW = parseInt(document.getElementById('cellsOnRow').value, 10);
    CELLSONCOLUMN = parseInt(document.getElementById('cellsOnColumn').value, 10);
    BOMBSNUMBER = parseInt(document.getElementById('bombsNumber').value, 10);
    CANVASWIDTH = CELLWIDTH * CELLSONROW;
    CANVASHEIGHT = CELLHEIGHT * CELLSONCOLUMN;
}

function resetGame() {
    GAMEOVER = false;
    extractValues();
    cells = [];
    setup();
}

function displayOverlay(bgColor, borderColor, message, progress) {
    const t = constrain(progress, 0, 1);
    const scale = easeOutBack(t);   // box pops in
    const bob = Math.sin(t * Math.PI) * 6; // small settle bob

    push();

    const boxW = width * 0.7;
    const boxH = 110;

    // Dim background fades in
    fill(0, 0, 0, 120 * t);
    noStroke();
    rect(0, 0, width, height);

    translate(width / 2, height / 2 - bob);
    scaleCanvas(scale);

    // Drop shadow
    drawingContext.shadowColor = 'rgba(0,0,0,0.5)';
    drawingContext.shadowBlur = 24;
    drawingContext.shadowOffsetY = 6;

    // Box
    fill(bgColor);
    stroke(borderColor);
    strokeWeight(3);
    rect(-boxW / 2, -boxH / 2, boxW, boxH, 16);

    drawingContext.shadowBlur = 0;
    drawingContext.shadowOffsetY = 0;

    // Text
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(28);
    textStyle(BOLD);
    drawingContext.shadowColor = 'rgba(0,0,0,0.8)';
    drawingContext.shadowBlur = 6;
    text(message, 0, -10);

    textSize(14);
    textStyle(NORMAL);
    drawingContext.shadowBlur = 3;
    fill(220);
    text('Click anywhere to play again', 0, 28);
    drawingContext.shadowBlur = 0;

    pop();
}

function scaleCanvas(s) {
    drawingContext.scale(s, s);
}

function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function displayWin(progress) {
    displayOverlay(color(34, 139, 34), color(144, 238, 144), '👑 You won the game! 👑', progress);
}

function displayLoss(progress) {
    displayOverlay(color(180, 30, 30), color(255, 100, 100), '💔 Game Over! You hit a bomb! 💔', progress);
}
