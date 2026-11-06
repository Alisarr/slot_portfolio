import { describe, expect, it } from "vitest";
import { generateChestRewards } from "./generateChestRewards";

describe("generateChestRewards", () => {
  it("shuffles all five rewards", () => {
    let calls = 0;

    const rewards = generateChestRewards(() => {
      calls += 1;
      return 0;
    });

    expect(rewards.map((reward) => reward.spins)).toEqual([
      5, 7, 10, 15, 3,
    ]);
    expect(calls).toBe(4);
  });

  it("creates a fresh reward list for every bonus", () => {
    const first = generateChestRewards(() => 0);
    const second = generateChestRewards(() => 0.999);

    expect(second.map((reward) => reward.spins)).toEqual([
      3, 5, 7, 10, 15,
    ]);

    expect(first.map((reward) => reward.spins)).toEqual([
      5, 7, 10, 15, 3,
    ]);

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