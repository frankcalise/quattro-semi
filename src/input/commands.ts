export type InputCommand =
  | { type: "move-selector"; columnDelta: number; rowDelta: number; tick: number }
  | { type: "swap"; tick: number }
  | { type: "manual-raise"; tick: number };
