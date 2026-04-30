export type LocalRecords = {
  highScore: number;
  bestTimeSeconds: number;
  maxChain: number;
  maxCombo: number;
  maxLevel: number;
};

export const emptyLocalRecords: LocalRecords = {
  highScore: 0,
  bestTimeSeconds: 0,
  maxChain: 0,
  maxCombo: 0,
  maxLevel: 0
};

export type RecordableResult = {
  elapsedTicks: number;
  level: number;
  maxChain: number;
  maxCombo: number;
  score: number;
};

export function mergeLocalRecords(records: LocalRecords, result: RecordableResult): LocalRecords {
  return {
    highScore: Math.max(records.highScore, result.score),
    bestTimeSeconds: Math.max(records.bestTimeSeconds, result.elapsedTicks),
    maxChain: Math.max(records.maxChain, result.maxChain),
    maxCombo: Math.max(records.maxCombo, result.maxCombo),
    maxLevel: Math.max(records.maxLevel, result.level)
  };
}
