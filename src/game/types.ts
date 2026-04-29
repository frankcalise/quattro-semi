export type Suit = "coppe" | "bastoni" | "spade" | "denari";

export type Tile = {
  id: string;
  suit: Suit;
};

export type Board = Tile[][];

export type Selector = {
  column: number;
  row: number;
};

export type ModeConfig = {
  id: "practice" | "classic";
  visibleColumns: number;
  visibleRows: number;
  automaticRise: boolean;
  relaxedGameOver: boolean;
  startingLevel: number;
  seedSalt: string;
};

export type GameState = {
  board: Board;
  boardHash: string;
  level: number;
  maxChain: number;
  maxCombo: number;
  mode: ModeConfig;
  phase: "playing" | "paused" | "game-over";
  riseOffset: number;
  score: number;
  seed: string;
  selector: Selector;
};
