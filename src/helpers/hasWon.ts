import { Cell } from "./generateBoard";

export default function hasWon(board: Cell[][]): boolean {
  return fullyRevealed(board) || allMinesFlagged(board);
}

const fullyRevealed = (board: Cell[][]): boolean =>
  board.every((row) =>
    row.every(
      (cell) =>
        (cell.isRevealed && !cell.hasMine) || (!cell.isRevealed && cell.hasMine)
    )
  );

const allMinesFlagged = (board: Cell[][]): boolean =>
  board.every((row) =>
    row.every(
      (cell) =>
        (cell.hasMine && cell.isFlagged) || (!cell.hasMine && !cell.isFlagged)
    )
  );
