"use client";

import copyBoard from "@/src/helpers/copyBoard";
import {
  Cell,
  flagObviousMines,
  generateBoardOnFirstClick,
  generateEmptyBoard,
  revealAllCells,
  revealCellAndNeighbors,
} from "@/src/helpers/generateBoard";
import hasWon from "@/src/helpers/hasWon";
import classNames from "classnames";
import { use, useState } from "react";

export default function Play({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [sizeX, sizeY] = slug.split("x").map(Number);

  const [board, setBoard] = useState<Cell[][]>(() =>
    generateEmptyBoard(sizeX, sizeY)
  );
  const [gameState, setGameState] = useState<
    "idle" | "playing" | "won" | "lost"
  >("idle");

  const handleReset = () => {
    setBoard(generateEmptyBoard(sizeX, sizeY));
    setGameState("idle");
  };

  if (isNaN(sizeX) || isNaN(sizeY) || sizeX <= 0 || sizeY <= 0)
    return (
      <div className="flex justify-center items-center h-screen w-full text-red-500">
        Invalid board size
      </div>
    );

  const MINE_COUNT = Math.floor((sizeX * sizeY) / 5); // 20% of the board
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-fit mx-auto flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          {sizeX}x{sizeY} Board
        </h1>
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reset
          </button>
          <span className="text-lg font-medium">
            Game State:{" "}
            <span
              className={classNames({
                "text-green-500": gameState === "won",
                "text-red-500": gameState === "lost",
                "text-yellow-500": gameState === "playing",
                "text-gray-500": gameState === "idle",
              })}
            >
              {gameState}
            </span>
          </span>
          <button
            onClick={() => {
              setBoard((oldBoard) => {
                const newBoard = copyBoard(oldBoard);
                flagObviousMines(newBoard);
                return newBoard;
              });
            }}
            disabled={gameState !== "playing"}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Flag obvious mines
          </button>
        </div>
        <div
          className={classNames("grid gap-1 mt-4 overflow-scroll")}
          style={{
            gridTemplateColumns: `repeat(${sizeY}, 2rem)`,
            gridTemplateRows: `repeat(${sizeX}, 2rem)`,
          }}
        >
          {board?.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={classNames(
                  "w-8 h-8 border border-gray-300 flex items-center justify-center",
                  {
                    "bg-sky-500 dark:bg-gray-500":
                      !cell.isRevealed && !cell.isFlagged,
                    "bg-red-400": !cell.isRevealed && cell.isFlagged,
                    "bg-gray-300 dark:bg-gray-900":
                      cell.isRevealed && !cell.hasMine,
                    "bg-red-500": cell.isRevealed && cell.hasMine,
                  }
                )}
                onClick={() => {
                  if (gameState === "lost" || gameState === "won") {
                    return;
                  }
                  if (gameState === "idle") {
                    setGameState("playing");
                    setBoard(
                      generateBoardOnFirstClick(
                        sizeX,
                        sizeY,
                        rowIndex,
                        colIndex,
                        MINE_COUNT
                      )
                    );
                  }
                  if (board[rowIndex][colIndex].isFlagged) return;

                  setBoard((oldBoard) => {
                    const newBoard = copyBoard(oldBoard);
                    const survived = revealCellAndNeighbors(
                      rowIndex,
                      colIndex,
                      newBoard
                    );
                    if (!survived) {
                      setGameState("lost");
                    } else if (hasWon(newBoard)) {
                      setGameState("won");
                      revealAllCells(newBoard);
                    }
                    return newBoard;
                  });
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (gameState !== "playing") return;
                  if (board[rowIndex][colIndex].isRevealed) return;

                  setBoard((oldBoard) => {
                    const newBoard = copyBoard(oldBoard);
                    newBoard[rowIndex][colIndex].isFlagged =
                      !newBoard[rowIndex][colIndex].isFlagged;
                    if (hasWon(newBoard)) {
                      setGameState("won");
                      revealAllCells(newBoard);
                    }
                    return newBoard;
                  });
                }}
              >
                {cell.isRevealed && !cell.hasMine && cell.neighborMines > 0
                  ? cell.neighborMines
                  : ""}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
