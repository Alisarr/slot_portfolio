import { describe, expect, it } from "vitest";
import type { Board, Payline } from "./types";
import { getSpinWin } from "./getSpinWin";

const TEST_PAYLINES = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
] as const satisfies readonly Payline[];

const board = [
  ["high-1", "low-1",  "high-2"],
  ["wild",   "low-1",  "low-2"],
  ["high-1", "low-1",  "low-3"],
  ["low-2",  "high-2", "high-3"],
  ["low-3",  "low-4",  "high-1"],
] as const satisfies Board;

describe("getSpinWin", () => {
  it("sums winning lines using the bet per active line", () => {
    expect(getSpinWin(board, TEST_PAYLINES, 2)).toBeCloseTo(2.8);
  });

  it("doubles the win when the total bet doubles", () => {
    expect(getSpinWin(board, TEST_PAYLINES, 4)).toBeCloseTo(5.6);
  });

  it("returns zero when there are no winning combinations", () => {
    const losingBoard = [
      ["low-1", "low-1", "low-1"],
      ["low-2", "low-2", "low-2"],
      ["low-1", "low-1", "low-1"],
      ["low-1", "low-1", "low-1"],
      ["low-1", "low-1", "low-1"],
    ] as const satisfies Board;

    expect(getSpinWin(losingBoard, TEST_PAYLINES, 2)).toBe(0);
  });
});