let CANVASWIDTH = 1000;
let CANVASHEIGHT = 1000;
let CELLWIDTH = 40;
let CELLHEIGHT = 40;
let CELLSONROW = 20;
let CELLSONCOLUMN = 20;
let BOMBSNUMBER = 100;
let GAMEOVER = false;

let cells = [];

function setup() {
    extractValues();
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

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
