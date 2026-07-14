import { Cell } from "./generateBoard";

export default function copyBoard(board: Cell[][]): Cell[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}
