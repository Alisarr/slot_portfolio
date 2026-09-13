import { describe, expect, it } from "vitest";

import { evaluatePayline, evaluatePaylines } from "./evaluatePayline";
import { MIDDLE_PAYLINE, BASE_PAYLINES, V_PAYLINE} from "./paylines";
import type { Board } from "./types";

describe("evaluatePayline", () => {
  it("finds three matching symbols from the left", () => {
    const board = [
      ["low-2", "high-1", "low-3"],
      ["low-1", "high-1", "low-4"],
      ["high-2", "high-1", "low-2"],
      ["high-2", "low-1", "high-3"],
      ["low-4", "high-3", "low-1"],
    ] as const satisfies Board;

    expect(evaluatePayline(board, MIDDLE_PAYLINE)).toEqual({
      symbol: "high-1",
      count: 3,
    });
  });

  it("rejects a sequence that breaks before the third reel", () => {
    const board = [
      ["low-2", "high-1", "low-3"],
      ["low-1", "high-1", "low-4"],
      ["high-2", "low-1", "low-2"],
      ["high-2", "high-1", "high-3"],
      ["low-4", "high-1", "low-1"],
    ] as const satisfies Board;

    expect(evaluatePayline(board, MIDDLE_PAYLINE)).toBeNull();
  });

  it("finds three matching symbols on the V payline", () => {
    const board = [
      ["high-2", "high-1", "low-3"],
      ["low-1", "high-2", "low-4"],
      ["high-1", "low-1", "high-2"],
      ["low-1", "high-1", "high-3"],
      ["low-4", "high-1", "low-1"],
    ] as const satisfies Board;

    expect(evaluatePayline(board, V_PAYLINE)).toEqual({
      symbol: "high-2",
      count: 3,
    });
  })

  it("finds wins on multiple paylines", () => {
    const board = [
      ["low-1", "low-2", "high-2"],
      ["low-1", "low-3", "high-2"],
      ["low-1", "low-4", "high-2"],
      ["high-1", "low-2", "high-2"],
      ["high-3", "low-3", "high-2"],
    ] as const satisfies Board;

    expect(evaluatePaylines(board, BASE_PAYLINES)).toEqual([
      {
        paylineIndex: 0,
        symbol: "low-1",
        count: 3,
      },
      {
        paylineIndex: 2,
        symbol: "high-2",
        count: 5,
      }
    ]);
  });
});
