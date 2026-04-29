import { applyCommand } from "@/game/engine";
import type { Board, BoardCell } from "@/game/types";

import { boardLabFixtures } from "./board-lab-fixtures";

describe("board lab fixtures", () => {
  it("do not start with accidental matches", () => {
    expect(
      boardLabFixtures.map((fixture) => ({
        id: fixture.id,
        matches: countMatches(fixture.state.board)
      }))
    ).toEqual([
      { id: "seeded", matches: 0 },
      { id: "clear-edge", matches: 0 },
      { id: "danger-rise", matches: 0 },
      { id: "fall-column", matches: 0 }
    ]);
  });

  it("clear edge creates one clear from the default swap", () => {
    const fixture = boardLabFixtures.find((value) => value.id === "clear-edge");

    expect(fixture).toBeDefined();

    const next = applyCommand(fixture!.state, { type: "swap", tick: 1 });

    expect(next.lastResolvedChain).toBe(1);
    expect(next.lastResolvedCombo).toBe(3);
  });

  it("gravity gap creates one clear after the default swap settles the column", () => {
    const fixture = boardLabFixtures.find((value) => value.id === "fall-column");

    expect(fixture).toBeDefined();

    const next = applyCommand(fixture!.state, { type: "swap", tick: 1 });

    expect(next.lastResolvedChain).toBe(1);
    expect(next.lastResolvedCombo).toBe(3);
  });
});

function countMatches(board: Board) {
  const matches = new Set<string>();

  for (let row = 0; row < board.length; row += 1) {
    collectLineMatches(board[row], (column) => `${row}:${column}`, matches);
  }

  for (let column = 0; column < (board[0]?.length ?? 0); column += 1) {
    collectLineMatches(
      board.map((row) => row[column]),
      (row) => `${row}:${column}`,
      matches
    );
  }

  return matches.size;
}

function collectLineMatches(line: BoardCell[], keyForIndex: (index: number) => string, matches: Set<string>) {
  let runStart = 0;

  for (let index = 1; index <= line.length; index += 1) {
    const previous = line[runStart];
    const current = line[index];

    if (previous !== null && current?.suit === previous.suit) {
      continue;
    }

    if (previous !== null && index - runStart >= 3) {
      for (let matchIndex = runStart; matchIndex < index; matchIndex += 1) {
        matches.add(keyForIndex(matchIndex));
      }
    }

    runStart = index;
  }
}
