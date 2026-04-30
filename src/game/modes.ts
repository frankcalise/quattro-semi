import type { ModeConfig } from "@/game/types";

export const practiceMode: ModeConfig = {
  id: "practice",
  visibleColumns: 6,
  visibleRows: 12,
  startingStackRows: 8,
  automaticRise: false,
  automaticRiseBaseTicks: 999999,
  automaticRiseLevelStepTicks: 0,
  automaticRiseMinimumTicks: 999999,
  relaxedGameOver: true,
  startingLevel: 1,
  seedSalt: "practice"
};

export const classicMode: ModeConfig = {
  id: "classic",
  visibleColumns: 6,
  visibleRows: 12,
  startingStackRows: 8,
  automaticRise: true,
  automaticRiseBaseTicks: 16,
  automaticRiseLevelStepTicks: 2,
  automaticRiseMinimumTicks: 6,
  relaxedGameOver: false,
  startingLevel: 1,
  seedSalt: "classic"
};
