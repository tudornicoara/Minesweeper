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
    return cells.every(cell => {
        return (cell.bomb && cell.flagged) || (!cell.bomb && cell.revealed);
    });
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

function revealRandomBomb() {
    let bombCells = cells.filter(
        cell => cell.bomb && !cell.flagged && !cell.revealed && hasRevealedNeighbors(cell)
    );
    if (bombCells.length > 0) {
        let randomBomb = random(bombCells);
        randomBomb.flagged = true;
    }
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

function displayOverlay(bgColor, borderColor, message) {
    push();

    const boxW = width * 0.7;
    const boxH = 110;
    const boxX = width / 2 - boxW / 2;
    const boxY = height / 2 - boxH / 2;

    // Dim background
    fill(0, 0, 0, 120);
    noStroke();
    rect(0, 0, width, height);

    // Drop shadow
    drawingContext.shadowColor = 'rgba(0,0,0,0.5)';
    drawingContext.shadowBlur = 24;
    drawingContext.shadowOffsetY = 6;

    // Box
    fill(bgColor);
    stroke(borderColor);
    strokeWeight(3);
    rect(boxX, boxY, boxW, boxH, 16);

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
    text(message, width / 2, height / 2 - 10);

    textSize(14);
    textStyle(NORMAL);
    drawingContext.shadowBlur = 3;
    fill(220);
    text('Click anywhere to play again', width / 2, height / 2 + 28);
    drawingContext.shadowBlur = 0;

    pop();
}

function displayWin() {
    displayOverlay(color(34, 139, 34), color(144, 238, 144), '👑 You won the game! 👑');
}

function displayLoss() {
    displayOverlay(color(180, 30, 30), color(255, 100, 100), '💔 Game Over! You hit a bomb! 💔');
}
