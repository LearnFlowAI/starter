import { calculateSessionPoints } from "../scoring";

describe("calculateSessionPoints", () => {
  it("calculates minute-based reward and pause penalty", () => {
    const points = calculateSessionPoints({ seconds: 180, pauseCount: 2 });
    expect(points).toBe(11);
  });

  it("never drops below 1 even with heavy pauses on short sessions", () => {
    const points = calculateSessionPoints({ seconds: 10, pauseCount: 10 });
    expect(points).toBe(1);
  });
});
