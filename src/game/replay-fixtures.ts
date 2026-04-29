import type { ReplayFixture } from "@/game/replay";

export const replayFixtures: ReplayFixture[] = [
  {
    id: "practice-basic-move-swap-raise",
    modeId: "practice",
    seed: "agent-loop-basic",
    commands: [
      { type: "move-selector", columnDelta: -2, rowDelta: 2, tick: 1 },
      { type: "swap", tick: 2 },
      { type: "manual-raise", tick: 3 },
      { type: "move-selector", columnDelta: 1, rowDelta: -1, tick: 4 },
      { type: "swap", tick: 5 },
      { type: "manual-raise", tick: 6 }
    ],
    expected: {
      boardHash: "______.______._____d.____sb.__sbcd.s_dccb.dbccss.ddsbbc.sdsdbs.bcbdcc.cddsbb.sbbscc",
      elapsedTicks: 6,
      level: 1,
      maxChain: 3,
      maxCombo: 3,
      phase: "playing",
      riseOffset: 2,
      score: 270,
      seed: "practice:agent-loop-basic",
      selector: "1,10"
    }
  }
];
