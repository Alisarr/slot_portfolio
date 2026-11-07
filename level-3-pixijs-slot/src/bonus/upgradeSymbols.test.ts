import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import { upgradeSymbols } from "./upgradeSymbols";

describe("upgradeSymbols", () => {
  it("upgrades low-1 and preserves the original board", () => {
    const board = [
      ["low-1", "low-2", "scatter"],
      ["wild", "low-1", "high-1"],
      ["low-3", "low-4", "high-2"],
      ["high-3", "low-1", "low-2"],
      ["low-1", "wild", "scatter"],
    ] as const satisfies Board;

    const upgraded = upgradeSymbols(board);

    expect(upgraded).toEqual([
      ["high-1", "low-2", "scatter"],
      ["wild", "high-1", "high-1"],
      ["low-3", "low-4", "high-2"],
      ["high-3", "high-1", "low-2"],
      ["high-1", "wild", "scatter"],
    ]);

    expect(upgraded).not.toBe(board);
    expect(board[0][0]).toBe("low-1");
    expect(board[1][1]).toBe("low-1");
    expect(board[3][1]).toBe("low-1");
    expect(board[4][0]).toBe("low-1");
  });
});