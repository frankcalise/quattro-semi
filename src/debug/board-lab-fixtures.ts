import { createGameStateFromBoard, createInitialGameState } from "@/game/engine";
import { practiceMode } from "@/game/modes";
import type { Board, GameState, Suit, Tile } from "@/game/types";

export type BoardLabFixture = {
  id: string;
  label: string;
  note: string;
  state: GameState;
};

const suits: Suit[] = ["coppe", "bastoni", "spade", "denari"];

export const boardLabFixtures: BoardLabFixture[] = [
  {
    id: "seeded",
    label: "Seeded",
    note: "Baseline seeded board for scale, suits, selector, and smoke checks.",
    state: createInitialGameState(practiceMode, "board-lab")
  },
  {
    id: "clear-edge",
    label: "Clear Edge",
    note: "Default Swap creates one horizontal Coppe match without other starting clears.",
    state: createGameStateFromBoard(practiceMode, "board-lab-clear-edge", createClearEdgeBoard())
  },
  {
    id: "danger-rise",
    label: "Danger Rise",
    note: "Places cards near the top loss line for danger-line and raise visibility checks.",
    state: createGameStateFromBoard(practiceMode, "board-lab-danger-rise", createDangerRiseBoard())
  },
  {
    id: "fall-column",
    label: "Gravity Gap",
    note: "Starts with a column gap; default Swap settles one Denari into a bottom-row clear.",
    state: createGameStateFromBoard(practiceMode, "board-lab-fall-column", createFallColumnBoard())
  }
];

function createClearEdgeBoard(): Board {
  const board = createNoMatchBoard(5);

  board[9][0] = createFixtureTile(9, 0, "coppe");
  board[9][1] = createFixtureTile(9, 1, "coppe");
  board[9][2] = createFixtureTile(9, 2, "denari");
  board[9][3] = createFixtureTile(9, 3, "coppe");

  return board;
}

function createDangerRiseBoard(): Board {
  return createNoMatchBoard(0);
}

function createFallColumnBoard(): Board {
  const board = createNoMatchBoard(4);

  board[8][2] = createFixtureTile(8, 2, "denari");
  board[9][2] = createFixtureTile(9, 2, "bastoni");
  board[9][3] = null;
  board[10][2] = null;
  board[11][0] = createFixtureTile(11, 0, "bastoni");
  board[11][1] = createFixtureTile(11, 1, "denari");
  board[11][2] = null;
  board[11][3] = createFixtureTile(11, 3, "denari");
  board[11][4] = createFixtureTile(11, 4, "spade");

  return board;
}

function createNoMatchBoard(emptyRows: number): Board {
  return Array.from({ length: practiceMode.visibleRows }, (_, row) =>
    Array.from({ length: practiceMode.visibleColumns }, (_, column) => {
      if (row < emptyRows) {
        return null;
      }

      const suit = suits[(row + column) % suits.length];
      return createFixtureTile(row, column, suit);
    })
  );
}

function createFixtureTile(row: number, column: number, suit: Suit): Tile {
  return {
    id: `fixture:${row}:${column}:${suit}`,
    suit
  };
}
