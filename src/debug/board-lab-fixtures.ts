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
    note: "Preloads a horizontal Coppe match near the center so Swap can exercise clear resolution.",
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
    note: "Starts with floating cards and a gap; press Swap to settle the column and clear the Denari run.",
    state: createGameStateFromBoard(practiceMode, "board-lab-fall-column", createFallColumnBoard())
  }
];

function createClearEdgeBoard(): Board {
  return createPatternBoard((row, column) => {
    if (row < 5) {
      return null;
    }

    if (row === 8 && column >= 2 && column <= 4) {
      return "coppe";
    }

    return suits[(row + column * 2) % suits.length];
  });
}

function createDangerRiseBoard(): Board {
  return createPatternBoard((row, column) => {
    if (row < 2) {
      return column % 2 === 0 ? "spade" : null;
    }

    return suits[(row * 2 + column) % suits.length];
  });
}

function createFallColumnBoard(): Board {
  return createPatternBoard((row, column) => {
    if (row < 4) {
      return null;
    }

    if (column === 2 && row >= 7 && row <= 9) {
      return null;
    }

    if (row === 10 && column >= 1 && column <= 3) {
      return "denari";
    }

    return suits[(row + column) % suits.length];
  });
}

function createPatternBoard(suitForCell: (row: number, column: number) => Suit | null): Board {
  return Array.from({ length: practiceMode.visibleRows }, (_, row) =>
    Array.from({ length: practiceMode.visibleColumns }, (_, column) => {
      const suit = suitForCell(row, column);
      return suit === null ? null : createFixtureTile(row, column, suit);
    })
  );
}

function createFixtureTile(row: number, column: number, suit: Suit): Tile {
  return {
    id: `fixture:${row}:${column}:${suit}`,
    suit
  };
}
