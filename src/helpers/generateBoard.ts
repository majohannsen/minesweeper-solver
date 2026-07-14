import { countNeighborMines, getNeighbors } from "./neighbors";

export interface Cell {
  row: number;
  col: number;
  hasMine: boolean;
  neighborMines: number;
  isRevealed: boolean;
  isFlagged: boolean;
}

export function generateEmptyBoard(x: number, y: number): Cell[][] {
  return Array.from({ length: x }, (_, r) =>
    Array.from({ length: y }, (_, c) => ({
      row: r,
      col: c,
      hasMine: false,
      neighborMines: 0,
      isRevealed: false,
      isFlagged: false,
    }))
  );
}

export const generateBoardOnFirstClick = (
  sizeX: number,
  sizeY: number,
  startR: number,
  startC: number,
  mineCount: number
): Cell[][] => {
  const newBoard = generateEmptyBoard(sizeX, sizeY);

  // Safety zone: clicked cell + 8 surrounding cells must not contain mines
  const safetySet = new Set<string>();
  safetySet.add(`${startR},${startC}`);
  getNeighbors(startR, startC).forEach((n) => {
    safetySet.add(`${n.r},${n.c}`);
  });

  // Create a pool of all coordinates excluding safety zone
  const availableCoordinates: { r: number; c: number }[] = [];
  for (let r = 0; r < sizeX; r++) {
    for (let c = 0; c < sizeY; c++) {
      if (!safetySet.has(`${r},${c}`)) {
        availableCoordinates.push({ r, c });
      }
    }
  }

  // Randomly select mineCount coordinates from available coordinates
  const selectedMines: { r: number; c: number }[] = [];
  for (let i = 0; i < mineCount; i++) {
    if (availableCoordinates.length === 0) break;
    const randomIndex = Math.floor(Math.random() * availableCoordinates.length);
    const [mineCoords] = availableCoordinates.splice(randomIndex, 1);
    selectedMines.push(mineCoords);
  }

  // Place mines
  selectedMines.forEach(({ r, c }) => {
    newBoard[r][c].hasMine = true;
  });

  // Calculate neighbors
  for (let r = 0; r < sizeX; r++) {
    for (let c = 0; c < sizeY; c++) {
      if (newBoard[r][c].hasMine) continue;
      newBoard[r][c].neighborMines = countNeighborMines(newBoard, r, c);
    }
  }

  return newBoard;
};

// amount of neighbors flagged >= neighbors with mines
const isObvious = (board: Cell[][], r: number, c: number): boolean => {
  const cell = board[r][c];
  if (!cell.isRevealed) return false;

  let flaggedNeighbors = 0;

  getNeighbors(r, c).forEach((n) => {
    if (n.r < 0 || n.r >= board.length || n.c < 0 || n.c >= board[0].length)
      return;
    if (board[n.r][n.c].isFlagged) flaggedNeighbors++;
  });

  return flaggedNeighbors >= cell.neighborMines;
};

// reveals the cell at (r, c)
// returns false if a mine was revealed, true otherwise
export const revealCell = (
  r: number,
  c: number,
  boardState: Cell[][]
): boolean => {
  const cell = boardState[r][c];
  if (cell.isFlagged || cell.isRevealed) return true;
  cell.isRevealed = true;
  return !cell.hasMine;
};

export const revealNeighborsIfObvious = (
  r: number,
  c: number,
  boardState: Cell[][]
): boolean => {
  if (!isObvious(boardState, r, c)) return true;
  const neighbors = getNeighbors(r, c);
  const zeroNeighbors: typeof neighbors = [];
  for (const n of neighbors) {
    if (
      n.r < 0 ||
      n.r >= boardState.length ||
      n.c < 0 ||
      n.c >= boardState[0].length
    )
      continue;
    const cell = boardState[n.r][n.c];
    if (!cell.isRevealed && !cell.isFlagged) {
      cell.isRevealed = true;
      if (cell.hasMine) return false;
      if (cell.neighborMines === 0) {
        zeroNeighbors.push(n);
      }
    }
  }
  return zeroNeighbors.every((n) =>
    revealNeighborsIfObvious(n.r, n.c, boardState)
  );
};

// reveals the cell at (r, c) and its neighbors if it has no neighboring mines
// returns false if a mine was revealed, true otherwise
export const revealCellAndNeighbors = (
  r: number,
  c: number,
  boardState: Cell[][]
): boolean => {
  const cell = boardState[r][c];
  if (cell.isFlagged) return true;
  if (!cell.isRevealed) {
    cell.isRevealed = true;
    if (cell.hasMine) return false;

    if (cell.neighborMines === 0)
      return revealNeighborsIfObvious(r, c, boardState);
  } else return revealNeighborsIfObvious(r, c, boardState);
  return true;
};

export const revealAllCells = (boardState: Cell[][]): void => {
  for (let r = 0; r < boardState.length; r++) {
    for (let c = 0; c < boardState[0].length; c++) {
      boardState[r][c].isRevealed = true;
      boardState[r][c].isFlagged = boardState[r][c].hasMine;
    }
  }
};
