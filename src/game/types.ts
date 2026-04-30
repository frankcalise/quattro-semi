export type Suit = "coppe" | "bastoni" | "spade" | "denari";

export type Tile = {
  id: string;
  suit: Suit;
};

export type BoardCell = Tile | null;

export type Board = BoardCell[][];

export type Selector = {
  column: number;
  row: number;
};

export type ModeConfig = {
  id: "practice" | "classic";
  visibleColumns: number;
  visibleRows: number;
  startingStackRows: number;
  automaticRise: boolean;
  automaticRiseBaseTicks: number;
  automaticRiseLevelStepTicks: number;
  automaticRiseMinimumTicks: number;
  relaxedGameOver: boolean;
  startingLevel: number;
  seedSalt: string;
};

export type GameState = {
  board: Board;
  boardHash: string;
  elapsedTicks: number;
  level: number;
  lastResolvedChain: number;
  lastResolvedCombo: number;
  maxChain: number;
  maxCombo: number;
  mode: ModeConfig;
  phase: "playing" | "paused" | "game-over";
  riseOffset: number;
  score: number;
  seed: string;
  selector: Selector;
};
