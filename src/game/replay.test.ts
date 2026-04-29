import { replayFixtures } from "@/game/replay-fixtures";
import { runReplayFixture } from "@/game/replay";

describe("replay fixtures", () => {
  it.each(replayFixtures)("$id matches its golden summary", (fixture) => {
    expect(runReplayFixture(fixture)).toEqual(fixture.expected);
  });
});
