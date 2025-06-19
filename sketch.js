let CANVASWIDTH = 1000;
let CANVASHEIGHT = 1000;
let CELLWIDTH = 40;
let CELLHEIGHT = 40;
let CELLSONROW = 20;
let CELLSONCOLUMN = 20;
let BOMBSNUMBER = 100;
let GAMEOVER = false;

function Cell() {
    this.x = 0;
    this.y = 0;
    this.w = CELLWIDTH;
    this.h = CELLHEIGHT;
    this.bomb = false;
    this.revealed = false;
    this.number = 0;
    this.flagged = false;

    this.show = function() {
        if (this.flagged) {
            fill(255);
            rect(this.x, this.y, this.w, this.h);
            fill(255, 0, 0);
            textAlign(CENTER, CENTER);
            textSize(16);
            text('🚩', this.x + this.w / 2, this.y + this.h / 2);
            return;
        }
        if (!this.revealed) {
            fill(255);
            rect(this.x, this.y, this.w, this.h);
        }
        if (this.revealed && !this.bomb && this.number === 0) {
            fill(220);
            rect(this.x, this.y, this.w, this.h);
        }
        if (this.revealed && this.bomb) {
            fill(255, 102, 102);
            rect(this.x, this.y, this.w, this.h);
            textAlign(CENTER, CENTER);
            textSize(20);
            text('💣', this.x + this.w / 2, this.y + this.h / 2);
        }
        if (this.revealed && !this.bomb && this.number > 0) {
            fill(220);
            rect(this.x, this.y, this.w, this.h);
            fill(getColor(this.number));
            textAlign(CENTER, CENTER);
            textSize(16);
            textStyle(BOLD);
            text(this.number, this.x + this.w / 2, this.y + this.h / 2);
        }
    };

    this.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
    };
}

function getColor(number) {
    switch (number) {
        case 1: return color(0, 0, 255);
        case 2: return color(0, 128, 0);
        case 3: return color(255, 0, 0);
        case 4: return color(128, 0, 128);
        case 5: return color(128, 128, 0);
        case 6: return color(0, 255, 255);
        case 7: return color(255, 165, 0);
        case 8: return color(128, 128, 128);
        default: return color(0);
    }
}

let cells = [];

function setup() {
    extractValues()
    createCanvas(CANVASWIDTH, CANVASHEIGHT);
    placeCells();
}

function draw() {
    background(220);
    cells.forEach(cell => {
        cell.show();
    });

    if (GAMEOVER) {
        if (gameWon())
            displayWin();
        else
            displayLoss();
    }

    fill(0);
}

function placeCells() {
    for (let i = 0; i < CELLSONCOLUMN; i++) {
        for (let j = 0; j < CELLSONROW; j++) {
            let cell = new Cell();
            cell.setPosition(j * CELLWIDTH, i * CELLHEIGHT);
            cells.push(cell);
        }
    }
}

function placeBombs() {
    let placedBombs = 0;
    while (placedBombs < BOMBSNUMBER) {
        let index =  Math.floor(random(cells.length));
        if (!cells[index].bomb) {
            cells[index].bomb = true;
            placedBombs++;
        }
    }
}

function setNeighborNumbers() {
    cells.forEach(cell => {
        if (!cell.bomb) {
            let neighbors = getNeighbors(cell);
            cell.number = neighbors.filter(neighbor => neighbor.bomb).length;
        }
    });
}

function getNeighbors(cell) {
    let neighbors = [];
    let x = cell.x / CELLWIDTH;
    let y = cell.y / CELLHEIGHT;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue; // Skip the cell itself
            let nx = x + i;
            let ny = y + j;
            if (nx >= 0 && nx < CELLSONROW && ny >= 0 && ny < CELLSONCOLUMN) {
                let neighborIndex = Math.floor(ny * CELLSONROW + nx);
                neighbors.push(cells[neighborIndex]);
            }
        }
    }
    return neighbors;
}

function mousePressed() {
    if (GAMEOVER) {
        resetGame();
        return;
    }

    let x = Math.floor(mouseX / CELLWIDTH);
    let y = Math.floor(mouseY / CELLHEIGHT);
    if (x >= 0 && x < CELLSONROW && y >= 0 && y < CELLSONCOLUMN) {
        let index = Math.floor(y * CELLSONROW + x);
        if (mouseButton === RIGHT) {
            if (!cells[index].revealed)
                cells[index].flagged = !cells[index].flagged;
        } else if (mouseButton === LEFT) {
            if (!cells[index].flagged) {
                if (cells.every(cell => !cell.revealed)) {
                    // Keep resetting until the clicked cell has number === 0 and is not a bomb
                    do {
                        resetCells();
                        placeBombs();
                        setNeighborNumbers();
                    } while (cells[index].bomb || cells[index].number !== 0);
                }
                if (cells[index].revealed) {
                    pressRevealedCell(cells[index]);
                } else {
                    if (cells[index].bomb) {
                        revealAllCells();
                        GAMEOVER = true;
                    } else {
                        cells[index].revealed = true;
                        if (cells[index].number === 0) {
                            revealNeighbors(cells[index]);
                        }
                    }
                }
            }
        }
    }

    if (gameWon()) {
        GAMEOVER = true;
    }
}

// Prevent context menu on right-click
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

function revealNeighbors(cell) {
    let neighbors = getNeighbors(cell);
    neighbors.forEach(neighbor => {
        if (!neighbor.revealed && !neighbor.bomb) {
            neighbor.revealed = true;
            if (neighbor.number === 0) {
                revealNeighbors(neighbor); // Recursively reveal neighbors
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
        })
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

function revealRandomBomb() {
    let bombCells = cells
        .filter(
            cell => cell.bomb &&
            !cell.flagged &&
                !cell.revealed
                && hasRevealedNeighbors(cell)
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

function revealAllBombs() {
    cells.forEach(cell => {
        if (cell.bomb) {
            cell.flagged = true;
        }
    });
}

function revealAllCells() {
    cells.forEach(cell => {
        cell.flagged = false;
        cell.revealed = true;
    });
}

function resetCells() {
    cells.forEach(cell => {
        cell.bomb = false;
        cell.revealed = false;
        cell.flagged = false;
        cell.number = 0;
    });
}

function resetGame() {
    GAMEOVER = false;
    extractValues();
    cells = [];
    setup();
}

function extractValues() {
    CANVASWIDTH = parseInt(document.getElementById('canvasWidth').value, 10);
    CANVASHEIGHT = parseInt(document.getElementById('canvasHeight').value, 10);
    CELLWIDTH = parseInt(document.getElementById('cellWidth').value, 10);
    CELLHEIGHT = parseInt(document.getElementById('cellHeight').value, 10);
    CELLSONROW = parseInt(document.getElementById('cellsOnRow').value, 10);
    CELLSONCOLUMN = parseInt(document.getElementById('cellsOnColumn').value, 10);
    BOMBSNUMBER = parseInt(document.getElementById('bombsNumber').value, 10);
}

function displayWin() {
    fill(0, 255, 0);
    textAlign(CENTER, CENTER);
    textSize(32);
    drawingContext.shadowColor = 'black';
    drawingContext.shadowBlur = 8;
    text('👑 Congratulations! You won the game! 👑', width / 2, height / 2);
    drawingContext.shadowBlur = 0; // Reset shadow
}

function displayLoss() {
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(32);
    drawingContext.shadowColor = 'black';
    drawingContext.shadowBlur = 8;
    text('💔 Game Over! You hit a bomb! 💔', width / 2, height / 2);
    drawingContext.shadowBlur = 0; // Reset shadow
}
