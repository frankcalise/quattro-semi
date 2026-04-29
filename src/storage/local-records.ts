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
