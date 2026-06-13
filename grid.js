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
        let index = Math.floor(random(cells.length));
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
            if (i === 0 && j === 0) continue;
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

function resetCells() {
    cells.forEach(cell => {
        cell.bomb = false;
        cell.revealed = false;
        cell.flagged = false;
        cell.number = 0;
    });
}
