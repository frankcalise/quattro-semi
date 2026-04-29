import { createRng } from "@/game/rng";
import type { Board, GameState, ModeConfig, Suit, Tile } from "@/game/types";

const suits: Suit[] = ["coppe", "bastoni", "spade", "denari"];

export function createInitialGameState(mode: ModeConfig, seed: string): GameState {
  const fullSeed = `${mode.seedSalt}:${seed}`;
  const board = createBoard(mode, fullSeed);

  return {
    board,
    boardHash: hashBoard(board),
    level: mode.startingLevel,
    maxChain: 0,
    maxCombo: 0,
    mode,
    phase: "playing",
    riseOffset: 0,
    score: 0,
    seed: fullSeed,
    selector: {
      column: Math.floor(mode.visibleColumns / 2) - 1,
      row: mode.visibleRows - 3
    }
  };
}

export function moveSelector(state: GameState, columnDelta: number, rowDelta: number): GameState {
  const selector = {
    column: clamp(state.selector.column + columnDelta, 0, state.mode.visibleColumns - 2),
    row: clamp(state.selector.row + rowDelta, 0, state.mode.visibleRows - 1)
  };

  return { ...state, selector };
}

export function swapSelected(state: GameState): GameState {
  const board = state.board.map((row) => [...row]);
  const { column, row } = state.selector;
  const left = board[row][column];
  const right = board[row][column + 1];
  board[row][column] = right;
  board[row][column + 1] = left;

  return {
    ...state,
    board,
    boardHash: hashBoard(board)
  };
}

export function hashBoard(board: Board) {
  return board
    .map((row) => row.map((tile) => tile.suit.charAt(0)).join(""))
    .join(".");
}

function createBoard(mode: ModeConfig, seed: string): Board {
  const rng = createRng(seed);

  return Array.from({ length: mode.visibleRows }, (_, row) =>
    Array.from({ length: mode.visibleColumns }, (_, column) => createTile(row, column, rng))
  );
}

function createTile(row: number, column: number, rng: () => number): Tile {
  const suit = suits[Math.floor(rng() * suits.length)] ?? "coppe";

  return {
    id: `${row}:${column}:${suit}`,
    suit
  };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
