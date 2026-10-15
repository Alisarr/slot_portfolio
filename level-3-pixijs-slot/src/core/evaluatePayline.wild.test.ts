import { describe, expect, it } from "vitest";
import type { Board } from "./types";
import { TOP_PAYLINE } from "./paylines";
import { evaluatePayline } from "./evaluatePayline";

describe("Wild payout selection", () => {
  it("chooses three Wilds when they pay more than substitution", () => {
    const board = [
      ["wild", "low-2", "low-3"],
      ["wild", "low-2", "low-3"],
      ["wild", "low-2", "low-3"],
      ["low-1", "low-2", "low-3"],
      ["low-2", "low-2", "low-3"],
    ] as const satisfies Board;

    expect(evaluatePayline(board, TOP_PAYLINE)).toEqual({
      symbol: "wild",
      count: 3,
    });
  });

  it("chooses substitution when it pays more than Wilds", () => {
    const board = [
      ["wild", "low-2", "low-3"],
      ["wild", "low-2", "low-3"],
      ["wild", "low-2", "low-3"],
      ["high-1", "low-2", "low-3"],
      ["high-1", "low-2", "low-3"],
    ] as const satisfies Board;

    expect(evaluatePayline(board, TOP_PAYLINE)).toEqual({
      symbol: "high-1",
      count: 5,
    });
  });

  it("does not award a separate Wild run starting in the middle", () => {
    const board = [
      ["high-1", "low-2", "low-3"],
      ["wild", "low-2", "low-3"],
      ["wild", "low-2", "low-3"],
      ["wild", "low-2", "low-3"],
      ["low-1", "low-2", "low-3"],
    ] as const satisfies Board;

    expect(evaluatePayline(board, TOP_PAYLINE)).toEqual({
      symbol: "high-1",
      count: 4,
    });
  });

  it("keeps a winning Wild run before a Scatter", () => {
    const board = [
      ["wild", "low-2", "low-3"],
      ["wild", "low-2", "low-3"],
      ["wild", "low-2", "low-3"],
      ["scatter", "low-2", "low-3"],
      ["high-1", "low-2", "low-3"],
    ] as const satisfies Board;

    expect(evaluatePayline(board, TOP_PAYLINE)).toEqual({
      symbol: "wild",
      count: 3,
    });
  });
});