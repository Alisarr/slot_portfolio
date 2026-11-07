import { describe, expect, it } from "vitest";
import { generateChestRewards } from "./generateChestRewards";

const originalRewards = [
  { type: "free-spins", spins: 5 },
  { type: "bonus-multiplier", multiplier: 3 },
  { type: "sticky-wild", reelIndex: 2 },
  { type: "free-spins", spins: 10 },
  { type: "free-spins", spins: 15 },
];

const shuffledRewards = [
  originalRewards[1],
  originalRewards[2],
  originalRewards[3],
  originalRewards[4],
  originalRewards[0],
];

describe("generateChestRewards", () => {
  it("shuffles all five rewards without losing any", () => {
    let calls = 0;

    const rewards = generateChestRewards(() => {
      calls += 1;
      return 0;
    });

    expect(rewards).toEqual(shuffledRewards);
    expect(calls).toBe(4);
  });

  it("creates a fresh reward list for every bonus", () => {
    const first = generateChestRewards(() => 0);
    const second = generateChestRewards(() => 0.999);

    expect(first).toEqual(shuffledRewards);
    expect(second).toEqual(originalRewards);
    expect(first).not.toBe(second);
  });

  it("rejects invalid random values", () => {
    for (const roll of [-0.1, 1, NaN, Infinity]) {
      expect(() => generateChestRewards(() => roll)).toThrow(
        "Random value must be >= 0 and < 1",
      );
    }
  });
});