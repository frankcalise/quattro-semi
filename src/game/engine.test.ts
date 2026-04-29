import {
  applyCommand,
  createGameStateFromBoard,
  createInitialGameState,
  moveSelector,
  raiseRows,
  replayCommands,
  swapSelected
} from "@/game/engine";
import { classicMode, practiceMode } from "@/game/modes";
import type { Board, ModeConfig, Suit, Tile } from "@/game/types";
import type { InputCommand } from "@/input/commands";

const compactMode: ModeConfig = {
  ...practiceMode,
  visibleColumns: 6,
  visibleRows: 6,
  startingStackRows: 3
};

describe("engine core", () => {
  it("creates reproducible boards from seed and mode", () => {
    const first = createInitialGameState(practiceMode, "same-seed");
    const second = createInitialGameState(practiceMode, "same-seed");

    expect(first.boardHash).toBe(second.boardHash);
  });

  it("starts with empty loss-line space above the stack", () => {
    const state = createInitialGameState(practiceMode, "air");

    expect(state.board.slice(0, 4).flat().every((cell) => cell === null)).toBe(true);
    expect(state.boardHash.startsWith("______")).toBe(true);
  });

  it("generates the starting stack without immediate matches", () => {
    const state = createInitialGameState(practiceMode, "quattro-semi");

    expect(findBoardMatches(state.board)).toEqual([]);
  });

  it("keeps the horizontal selector in bounds", () => {
    const state = createInitialGameState(practiceMode, "bounds");
    const moved = moveSelector(state, 100, 100);

    expect(moved.selector.column).toBe(practiceMode.visibleColumns - 2);
    expect(moved.selector.row).toBe(practiceMode.visibleRows - 1);
  });

  it("swaps the two selected cards", () => {
    const state = withSelector(
      boardFromRows(["______", "______", "______", "______", "______", "cbsddb"]),
      0,
      5
    );
    const { column, row } = state.selector;
    const left = state.board[row][column];
    const right = state.board[row][column + 1];
    const swapped = swapSelected(state);

    expect(swapped.board[row][column]).toBe(right);
    expect(swapped.board[row][column + 1]).toBe(left);
  });

  it("settles a tile after swapping it into a blank space", () => {
    const state = withSelector(
      boardFromRows(["______", "______", "______", "_c____", "______", "______"]),
      0,
      3
    );
    const resolved = swapSelected(state);

    expect(resolved.boardHash).toBe("______.______.______.______.______.c_____");
  });

  it("clears horizontal matches, applies gravity, and records combo stats", () => {
    const state = withSelector(
      boardFromRows(["______", "______", "______", "______", "______", "cbccsd"]),
      0,
      5
    );
    const resolved = swapSelected(state);

    expect(resolved.boardHash).toBe("______.______.______.______.______.b___sd");
    expect(resolved.score).toBe(30);
    expect(resolved.lastResolvedChain).toBe(1);
    expect(resolved.lastResolvedCombo).toBe(3);
    expect(resolved.maxCombo).toBe(3);
  });

  it("clears vertical matches", () => {
    const state = withSelector(
      boardFromRows(["______", "______", "c_____", "c_____", "bc____", "d_b_dd"]),
      0,
      4
    );
    const resolved = swapSelected(state);

    expect(resolved.boardHash).toBe("______.______.______.______.______.dbb_dd");
    expect(resolved.score).toBe(30);
  });

  it("counts cascades as chains", () => {
    const state = withSelector(
      boardFromRows(["______", "______", "__c___", "_c____", "c_____", "bbbdb_"]),
      3,
      5
    );
    const resolved = swapSelected(state);

    expect(resolved.lastResolvedChain).toBe(2);
    expect(resolved.maxChain).toBe(2);
    expect(resolved.lastResolvedCombo).toBe(4);
    expect(resolved.score).toBe(145);
    expect(resolved.boardHash).toBe("______.______.______.______.______.____d_");
  });

  it("raises deterministic rows and preserves replay from seed plus inputs", () => {
    const commands: InputCommand[] = [
      { type: "move-selector", columnDelta: -2, rowDelta: 2, tick: 1 },
      { type: "swap", tick: 2 },
      { type: "manual-raise", tick: 3 },
      { type: "manual-raise", tick: 4 }
    ];

    const first = replayCommands(practiceMode, "fixture", commands);
    const second = replayCommands(practiceMode, "fixture", commands);

    expect(first.boardHash).toBe(second.boardHash);
    expect(first.score).toBe(second.score);
    expect(first.elapsedTicks).toBe(4);
    expect(first.riseOffset).toBe(2);
  });

  it("generates rising rows without immediate matches", () => {
    let state = createInitialGameState(practiceMode, "raise-clean");

    for (let index = 0; index < 6; index += 1) {
      state = raiseRows(state, 1);
      expect(findBoardMatches(state.board)).toEqual([]);
    }
  });

  it("checks the loss line when strict modes raise into occupied top space", () => {
    const strictMode = { ...classicMode, visibleRows: 6, startingStackRows: 6 };
    const board = boardFromRows(["c_____", "______", "______", "______", "______", "______"]);
    const state = createGameStateFromBoard(strictMode, "loss", board);

    expect(raiseRows(state, 1).phase).toBe("game-over");
  });

  it("keeps relaxed practice playable when the loss line is occupied", () => {
    const board = boardFromRows(["c_____", "______", "______", "______", "______", "______"]);
    const state = createGameStateFromBoard(compactMode, "relaxed", board);

    expect(applyCommand(state, { type: "manual-raise", tick: 1 }).phase).toBe("playing");
  });
});

function withSelector(board: Board, column: number, row: number) {
  return {
    ...createGameStateFromBoard(compactMode, "fixture", board),
    selector: { column, row }
  };
}

function boardFromRows(rows: string[]): Board {
  return rows.map((row, rowIndex) =>
    [...row].map((letter, columnIndex) => {
      if (letter === "_") {
        return null;
      }

      return tile(suitFromLetter(letter), `${rowIndex}:${columnIndex}`);
    })
  );
}

function tile(suit: Suit, id: string): Tile {
  return {
    id,
    suit
  };
}

function suitFromLetter(letter: string): Suit {
  if (letter === "b") {
    return "bastoni";
  }

  if (letter === "s") {
    return "spade";
  }

  if (letter === "d") {
    return "denari";
  }

  return "coppe";
}

function findBoardMatches(board: Board) {
  const matches: string[] = [];

  for (let row = 0; row < board.length; row += 1) {
    for (let column = 0; column < board[row].length - 2; column += 1) {
      const first = board[row][column];
      const second = board[row][column + 1];
      const third = board[row][column + 2];

      if (first && second && third && first.suit === second.suit && second.suit === third.suit) {
        matches.push(`${row}:${column}:h`);
      }
    }
  }

  for (let row = 0; row < board.length - 2; row += 1) {
    for (let column = 0; column < board[row].length; column += 1) {
      const first = board[row][column];
      const second = board[row + 1][column];
      const third = board[row + 2][column];

      if (first && second && third && first.suit === second.suit && second.suit === third.suit) {
        matches.push(`${row}:${column}:v`);
      }
    }
  }

  return matches;
}
