import { emptyLocalRecords, mergeLocalRecords } from "@/storage/local-records";

describe("local records", () => {
  it("keeps the best classic results across repeated runs", () => {
    const first = mergeLocalRecords(emptyLocalRecords, {
      elapsedTicks: 42,
      level: 2,
      maxChain: 1,
      maxCombo: 3,
      score: 120
    });
    const second = mergeLocalRecords(first, {
      elapsedTicks: 30,
      level: 3,
      maxChain: 2,
      maxCombo: 4,
      score: 90
    });

    expect(second).toEqual({
      highScore: 120,
      bestTimeSeconds: 42,
      maxChain: 2,
      maxCombo: 4,
      maxLevel: 3
    });
  });
});
