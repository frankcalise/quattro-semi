import type { GameState } from "@/game/types";
import type { InputCommand } from "@/input/commands";

export type FeedbackEvent = "move" | "swap" | "invalid" | "clear" | "chain" | "combo" | "raise" | "danger" | "game-over";

export function deriveFeedbackEvents(previous: GameState, next: GameState, command: InputCommand): FeedbackEvent[] {
  const events: FeedbackEvent[] = [];

  if (previous.phase !== "game-over" && next.phase === "game-over") {
    return ["game-over"];
  }

  if (next.riseOffset > previous.riseOffset) {
    events.push("raise");

    if (isDangerState(next)) {
      events.push("danger");
    }
  }

  if (command.type === "move-selector" && selectorMoved(previous, next)) {
    events.push("move");
  }

  if (command.type === "swap") {
    events.push(boardChanged(previous, next) ? "swap" : "invalid");
  }

  if (next.score > previous.score && next.lastResolvedChain > 0) {
    events.push("clear");

    if (next.lastResolvedChain > 1) {
      events.push("chain");
    }

    if (next.lastResolvedCombo > 3) {
      events.push("combo");
    }
  }

  return [...new Set(events)];
}

export function primaryAnimationForEvents(events: FeedbackEvent[]): "move" | "swap" | "raise" | "settle" | "clear" {
  if (events.includes("clear") || events.includes("chain") || events.includes("combo")) {
    return "clear";
  }

  if (events.includes("raise") || events.includes("danger") || events.includes("game-over")) {
    return "raise";
  }

  if (events.includes("swap") || events.includes("invalid")) {
    return "swap";
  }

  return "move";
}

function selectorMoved(previous: GameState, next: GameState) {
  return previous.selector.column !== next.selector.column || previous.selector.row !== next.selector.row;
}

function boardChanged(previous: GameState, next: GameState) {
  return previous.boardHash !== next.boardHash || previous.score !== next.score || previous.riseOffset !== next.riseOffset;
}

function isDangerState(state: GameState) {
  return state.board.slice(0, 2).some((row) => row.some(Boolean));
}
