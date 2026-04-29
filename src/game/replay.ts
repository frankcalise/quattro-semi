import { replayCommands } from "@/game/engine";
import { classicMode, practiceMode } from "@/game/modes";
import type { GameState, ModeConfig } from "@/game/types";
import type { InputCommand } from "@/input/commands";

export type GameSummary = {
  boardHash: string;
  elapsedTicks: number;
  level: number;
  maxChain: number;
  maxCombo: number;
  phase: GameState["phase"];
  riseOffset: number;
  score: number;
  seed: string;
  selector: string;
};

export type ReplayFixture = {
  id: string;
  modeId: ModeConfig["id"];
  seed: string;
  commands: InputCommand[];
  expected: GameSummary;
};

const modesById: Record<ModeConfig["id"], ModeConfig> = {
  classic: classicMode,
  practice: practiceMode
};

export function runReplayFixture(fixture: ReplayFixture): GameSummary {
  return summarizeGameState(replayCommands(modesById[fixture.modeId], fixture.seed, fixture.commands));
}

export function summarizeGameState(state: GameState): GameSummary {
  return {
    boardHash: state.boardHash,
    elapsedTicks: state.elapsedTicks,
    level: state.level,
    maxChain: state.maxChain,
    maxCombo: state.maxCombo,
    phase: state.phase,
    riseOffset: state.riseOffset,
    score: state.score,
    seed: state.seed,
    selector: `${state.selector.column},${state.selector.row}`
  };
}

export function formatGameSummary(summary: GameSummary) {
  return [
    `seed ${summary.seed}`,
    `phase ${summary.phase}`,
    `time ${summary.elapsedTicks}`,
    `score ${summary.score}`,
    `level ${summary.level}`,
    `chain ${summary.maxChain}`,
    `combo ${summary.maxCombo}`,
    `selector ${summary.selector}`,
    `rise ${summary.riseOffset}`,
    `board ${summary.boardHash}`
  ].join(" | ");
}
