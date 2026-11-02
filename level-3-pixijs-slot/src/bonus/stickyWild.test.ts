import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import type { StickyWildReel } from "./stickyWilds";
import { applyStickyWilds,
  collectStickyWilds,
 } from "./stickyWilds";

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

  describe("collectStickyWilds", () => {
  const boardWithWilds = [
    board[0],
    ["wild", "high-2", "low-4"],
    board[2],
    ["low-4", "wild", "wild"],
    board[4],
  ] as const satisfies Board;

  it("collects each new Wild reel once", () => {
    const result = collectStickyWilds(
      boardWithWilds,
      [],
      () => 2,
    );

    expect(result).toEqual([
      { reelIndex: 1, multiplier: 2 },
      { reelIndex: 3, multiplier: 2 },
    ]);
  });

  it("preserves an existing multiplier and adds only the new reel", () => {
    const existing: readonly StickyWildReel[] = [
      { reelIndex: 1, multiplier: 5 },
    ];

    let multiplierCalls = 0;

    const result = collectStickyWilds(
      boardWithWilds,
      existing,
      () => {
        multiplierCalls += 1;
        return 3;
      },
    );

    expect(result).toEqual([
      { reelIndex: 1, multiplier: 5 },
      { reelIndex: 3, multiplier: 3 },
    ]);

    expect(multiplierCalls).toBe(1);

    expect(existing).toEqual([
      { reelIndex: 1, multiplier: 5 },
    ]);
  });

  it("keeps a sticky reel when the next board has no Wilds", () => {
    const existing: readonly StickyWildReel[] = [
      { reelIndex: 1, multiplier: 2 },
    ];

    const result = collectStickyWilds(board, existing, () => 7);
    const expandedBoard = applyStickyWilds(board, result);

    expect(result).toEqual(existing);
    expect(expandedBoard[1]).toEqual(["wild", "wild", "wild"]);
  });
});
});