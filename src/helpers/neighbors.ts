import { Cell } from "./generateBoard";

export const getNeighbors = (r: number, c: number) => {
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      neighbors.push({ r: nr, c: nc });
    }
  }
  return neighbors;
};

export const countNeighborMines = (
  board: Cell[][],
  r: number,
  c: number
): number => {
  let count = 0;
  getNeighbors(r, c).forEach((n) => {
    if (n.r < 0 || n.r >= board.length || n.c < 0 || n.c >= board[0].length) {
      return;
    }
    if (board[n.r][n.c].hasMine) {
      count++;
    }
  });
  return count;
};
