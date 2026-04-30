import { createGameStateFromBoard } from "@/game/engine";
import { deriveFeedbackEvents } from "@/game/feedback";
import { practiceMode } from "@/game/modes";
import type { Board, Suit, Tile } from "@/game/types";

describe("game feel feedback", () => {
  it("emits clear, chain, and combo feedback from resolved state deltas", () => {
    const previous = stateFromRows(["______", "______", "______", "______", "______", "cbccsd"]);
    const next = {
      ...previous,
      boardHash: "______.______.______.______.______.b___sd",
      lastResolvedChain: 2,
      lastResolvedCombo: 4,
      maxChain: 2,
      maxCombo: 4,
      score: 145
    };

    expect(deriveFeedbackEvents(previous, next, { type: "swap", tick: 1 })).toEqual([
      "swap",
      "clear",
      "chain",
      "combo"
    ]);
  });

  it("treats an unchanged swap as invalid feedback", () => {
    const previous = stateFromRows(["______", "______", "______", "______", "______", "______"]);
    const next = { ...previous, elapsedTicks: 1 };

    expect(deriveFeedbackEvents(previous, next, { type: "swap", tick: 1 })).toEqual(["invalid"]);
  });

  it("prioritizes game over feedback over lower-level events", () => {
    const previous = stateFromRows(["c_____", "______", "______", "______", "______", "______"]);
    const next = { ...previous, phase: "game-over" as const, riseOffset: 1 };

    expect(deriveFeedbackEvents(previous, next, { type: "manual-raise", tick: 1 })).toEqual(["game-over"]);
  });
});

function stateFromRows(rows: string[]) {
  return createGameStateFromBoard({ ...practiceMode, visibleRows: rows.length }, "feel", boardFromRows(rows));
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
