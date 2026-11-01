import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import { applyStickyWilds } from "./stickyWilds";

const board = [
  ["low-1", "high-1", "low-3"],
  ["low-2", "high-2", "low-4"],
  ["high-3", "low-1", "low-2"],
  ["low-4", "high-1", "low-3"],
  ["low-1", "low-2", "high-2"],
] as const satisfies Board;

describe("applyStickyWilds", () => {
  it("replaces selected reels and preserves the other reels", () => {
    const result = applyStickyWilds(board, [
      { reelIndex: 1, multiplier: 2 },
      { reelIndex: 3, multiplier: 3 },
    ]);

    expect(result).toEqual([
      ["low-1", "high-1", "low-3"],
      ["wild", "wild", "wild"],
      ["high-3", "low-1", "low-2"],
      ["wild", "wild", "wild"],
      ["low-1", "low-2", "high-2"],
    ]);
  });

  it("does not change the original board", () => {
    applyStickyWilds(board, [
      { reelIndex: 1, multiplier: 2 },
    ]);

    expect(board).toEqual([
      ["low-1", "high-1", "low-3"],
      ["low-2", "high-2", "low-4"],
      ["high-3", "low-1", "low-2"],
      ["low-4", "high-1", "low-3"],
      ["low-1", "low-2", "high-2"],
    ]);
  });

  it("preserves all symbols when no reels are sticky", () => {
    const result = applyStickyWilds(board, []);

    expect(result).toEqual(board);
  });
});