import { describe, expect, it } from "vitest";
import type { PaylineMatch } from "../core/types";
import { getStickyWildMultiplier } from "./getStickyWildMultiplier";

const match: PaylineMatch = {
  symbol: "low-1",
  count: 3,
};

describe("getStickyWildMultiplier", () => {
  it("returns one when there are no sticky Wilds", () => {
    const multiplier = getStickyWildMultiplier(match, []);

    expect(multiplier).toBe(1);
  });

  it("uses the multiplier of a participating Wild", () => {
    const multiplier = getStickyWildMultiplier(match, [
      { reelIndex: 1, multiplier: 3 },
    ]);

    expect(multiplier).toBe(3);
  });

  it("adds multipliers of participating Wilds", () => {
    const multiplier = getStickyWildMultiplier(match, [
      { reelIndex: 0, multiplier: 2 },
      { reelIndex: 2, multiplier: 3 },
    ]);

    expect(multiplier).toBe(5);
  });

  it("ignores a Wild immediately after the winning combination", () => {
    const multiplier = getStickyWildMultiplier(match, [
      { reelIndex: 3, multiplier: 10 },
    ]);

    expect(multiplier).toBe(1);
  });

  it("counts only Wilds inside the winning combination", () => {
    const multiplier = getStickyWildMultiplier(match, [
      { reelIndex: 1, multiplier: 2 },
      { reelIndex: 4, multiplier: 10 },
    ]);

    expect(multiplier).toBe(2);
  });

  it("keeps multipliers of one neutral", () => {
    const multiplier = getStickyWildMultiplier(match, [
      { reelIndex: 0, multiplier: 1 },
      { reelIndex: 1, multiplier: 1 },
    ]);

    expect(multiplier).toBe(1);
  });
});