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
        cell.revealedAt = null;
        cell.flaggedAt = null;
    });
}

function canSolveWithoutGuessing(startIndex) {
    const n = cells.length;
    const cellIndexMap = new Map(cells.map((cell, i) => [cell, i]));
    const revealed = new Array(n).fill(false);
    const flagged = new Array(n).fill(false);

    function cascadeReveal(idx) {
        const queue = [idx];
        while (queue.length > 0) {
            const ci = queue.shift();
            if (revealed[ci] || cells[ci].bomb) continue;
            revealed[ci] = true;
            if (cells[ci].number === 0) {
                getNeighbors(cells[ci]).forEach(nb => {
                    const ni = cellIndexMap.get(nb);
                    if (!revealed[ni]) queue.push(ni);
                });
            }
        }
    }

    cascadeReveal(startIndex);

    let changed = true;
    while (changed) {
        changed = false;
        const constraints = [];

        for (let i = 0; i < n; i++) {
            if (!revealed[i] || cells[i].bomb || cells[i].number === 0) continue;

            const neighbors = getNeighbors(cells[i]);
            const unrevUnflagged = [];
            let flaggedCount = 0;

            for (const nb of neighbors) {
                const ni = cellIndexMap.get(nb);
                if (flagged[ni]) flaggedCount++;
                else if (!revealed[ni]) unrevUnflagged.push(ni);
            }

            const remaining = cells[i].number - flaggedCount;

            if (remaining === 0 && unrevUnflagged.length > 0) {
                for (const ni of unrevUnflagged) {
                    revealed[ni] = true;
                    changed = true;
                    cascadeReveal(ni);
                }
            } else if (remaining > 0 && remaining === unrevUnflagged.length) {
                for (const ni of unrevUnflagged) {
                    if (!flagged[ni]) { flagged[ni] = true; changed = true; }
                }
            } else if (remaining > 0 && unrevUnflagged.length > remaining) {
                constraints.push({ indices: unrevUnflagged, count: remaining });
            }
        }

        if (!changed) {
            outer:
            for (let a = 0; a < constraints.length; a++) {
                for (let b = 0; b < constraints.length; b++) {
                    if (a === b) continue;
                    const ca = constraints[a], cb = constraints[b];
                    if (ca.indices.length >= cb.indices.length) continue;
                    if (!ca.indices.every(i => cb.indices.includes(i))) continue;

                    const diff = cb.indices.filter(i => !ca.indices.includes(i));
                    const diffCount = cb.count - ca.count;

                    if (diffCount === 0) {
                        for (const ni of diff) { revealed[ni] = true; changed = true; cascadeReveal(ni); }
                        break outer;
                    } else if (diffCount === diff.length) {
                        for (const ni of diff) { if (!flagged[ni]) { flagged[ni] = true; changed = true; } }
                        break outer;
                    }
                }
            }
        }
    }

    return cells.every((cell, i) => (cell.bomb && flagged[i]) || (!cell.bomb && revealed[i]));
}
