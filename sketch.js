let CANVASWIDTH = 1000;
let CANVASHEIGHT = 1000;
let CELLWIDTH = 40;
let CELLHEIGHT = 40;
let CELLSONROW = 20;
let CELLSONCOLUMN = 20;
let BOMBSNUMBER = 100;
let GAMEOVER = false;
let gameoverAt = null;

let cells = [];

function setup() {
    extractValues();
    createCanvas(CANVASWIDTH, CANVASHEIGHT);
    placeCells();
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

    fill(0);
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
                    let attempts = 0;
                    do {
                        do {
                            resetCells();
                            placeBombs();
                            setNeighborNumbers();
                        } while (cells[index].bomb || cells[index].number !== 0);
                        attempts++;
                    } while (document.getElementById('noGuessing').checked &&
                             !canSolveWithoutGuessing(index) && attempts < 500);
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

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
