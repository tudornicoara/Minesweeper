import { state } from './state';
import { Cell } from './cell';

export function placeCells(): void {
  for (let i = 0; i < state.CELLSONCOLUMN; i++) {
    for (let j = 0; j < state.CELLSONROW; j++) {
      const cell = new Cell();
      cell.col = j;
      cell.row = i;
      cell.w = state.CELLW;
      cell.h = state.CELLH;
      cell.setPosition(j * state.CELLW, i * state.CELLH);
      state.cells.push(cell);
    }
  }
}

export function placeBombs(): void {
  let placedBombs = 0;
  while (placedBombs < state.BOMBSNUMBER) {
    const index = Math.floor(random(state.cells.length));
    if (!state.cells[index].bomb) {
      state.cells[index].bomb = true;
      placedBombs++;
    }
  }
}

export function setNeighborNumbers(): void {
  state.cells.forEach((cell) => {
    if (!cell.bomb) {
      const neighbors = getNeighbors(cell);
      cell.number = neighbors.filter((neighbor) => neighbor.bomb).length;
    }
  });
}

export function getNeighbors(cell: Cell): Cell[] {
  const neighbors: Cell[] = [];
  const x = cell.col;
  const y = cell.row;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const nx = x + i;
      const ny = y + j;
      if (nx >= 0 && nx < state.CELLSONROW && ny >= 0 && ny < state.CELLSONCOLUMN) {
        const neighborIndex = Math.floor(ny * state.CELLSONROW + nx);
        neighbors.push(state.cells[neighborIndex]);
      }
    }
  }
  return neighbors;
}

export function resetCells(): void {
  state.cells.forEach((cell) => {
    cell.bomb = false;
    cell.revealed = false;
    cell.flagged = false;
    cell.number = 0;
    cell.revealedAt = null;
    cell.flaggedAt = null;
  });
}

interface Constraint {
  indices: number[];
  count: number;
}

export function canSolveWithoutGuessing(startIndex: number): boolean {
  const cells = state.cells;
  const n = cells.length;
  const cellIndexMap = new Map<Cell, number>(cells.map((cell, i) => [cell, i]));
  const revealed = new Array<boolean>(n).fill(false);
  const flagged = new Array<boolean>(n).fill(false);

  function cascadeReveal(idx: number): void {
    const queue = [idx];
    while (queue.length > 0) {
      const ci = queue.shift()!;
      if (revealed[ci] || cells[ci].bomb) continue;
      revealed[ci] = true;
      if (cells[ci].number === 0) {
        getNeighbors(cells[ci]).forEach((nb) => {
          const ni = cellIndexMap.get(nb)!;
          if (!revealed[ni]) queue.push(ni);
        });
      }
    }
  }

  cascadeReveal(startIndex);

  let changed = true;
  while (changed) {
    changed = false;
    const constraints: Constraint[] = [];

    for (let i = 0; i < n; i++) {
      if (!revealed[i] || cells[i].bomb || cells[i].number === 0) continue;

      const neighbors = getNeighbors(cells[i]);
      const unrevUnflagged: number[] = [];
      let flaggedCount = 0;

      for (const nb of neighbors) {
        const ni = cellIndexMap.get(nb)!;
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
          if (!flagged[ni]) {
            flagged[ni] = true;
            changed = true;
          }
        }
      } else if (remaining > 0 && unrevUnflagged.length > remaining) {
        constraints.push({ indices: unrevUnflagged, count: remaining });
      }
    }

    if (!changed) {
      outer: for (let a = 0; a < constraints.length; a++) {
        for (let b = 0; b < constraints.length; b++) {
          if (a === b) continue;
          const ca = constraints[a];
          const cb = constraints[b];
          if (ca.indices.length >= cb.indices.length) continue;
          if (!ca.indices.every((i) => cb.indices.includes(i))) continue;

          const diff = cb.indices.filter((i) => !ca.indices.includes(i));
          const diffCount = cb.count - ca.count;

          if (diffCount === 0) {
            for (const ni of diff) {
              revealed[ni] = true;
              changed = true;
              cascadeReveal(ni);
            }
            break outer;
          } else if (diffCount === diff.length) {
            for (const ni of diff) {
              if (!flagged[ni]) {
                flagged[ni] = true;
                changed = true;
              }
            }
            break outer;
          }
        }
      }
    }
  }

  return cells.every((cell, i) => (cell.bomb && flagged[i]) || (!cell.bomb && revealed[i]));
}
