import type { ModeConfig } from "@/game/types";

export const practiceMode: ModeConfig = {
  id: "practice",
  visibleColumns: 6,
  visibleRows: 12,
  automaticRise: false,
  relaxedGameOver: true,
  startingLevel: 1,
  seedSalt: "practice"
};

export const classicMode: ModeConfig = {
  id: "classic",
  visibleColumns: 6,
  visibleRows: 12,
  automaticRise: true,
  relaxedGameOver: false,
  startingLevel: 1,
  seedSalt: "classic"
};
