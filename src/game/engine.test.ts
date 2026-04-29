import { createInitialGameState, moveSelector, swapSelected } from "@/game/engine";
import { practiceMode } from "@/game/modes";

describe("engine scaffold", () => {
  it("creates reproducible boards from seed and mode", () => {
    const first = createInitialGameState(practiceMode, "same-seed");
    const second = createInitialGameState(practiceMode, "same-seed");

    expect(first.boardHash).toBe(second.boardHash);
  });

  it("keeps the horizontal selector in bounds", () => {
    const state = createInitialGameState(practiceMode, "bounds");
    const moved = moveSelector(state, 100, 100);

    expect(moved.selector.column).toBe(practiceMode.visibleColumns - 2);
    expect(moved.selector.row).toBe(practiceMode.visibleRows - 1);
  });

  it("swaps the two selected cards", () => {
    const state = createInitialGameState(practiceMode, "swap");
    const { column, row } = state.selector;
    const left = state.board[row][column];
    const right = state.board[row][column + 1];
    const swapped = swapSelected(state);

    expect(swapped.board[row][column]).toBe(right);
    expect(swapped.board[row][column + 1]).toBe(left);
  });
});
