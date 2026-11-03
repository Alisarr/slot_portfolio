import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import { TOP_PAYLINE } from "../core/paylines";
import { evaluateSpin } from "../core/evaluateSpin";
import { createGameSession, playFreeSpin } from "./GameSession";

const board = [
  ["wild", "wild", "wild"],
  ["wild", "wild", "wild"],
  ["wild", "wild", "wild"],
  ["low-1", "low-1", "low-1"],
  ["wild", "wild", "wild"],
] as const satisfies Board;

describe("sticky Wild payouts", () => {
  it("keeps the ordinary payout without multipliers", () => {
    const result = evaluateSpin(board, [TOP_PAYLINE], 1);

    expect(result.lineWins).toEqual([
      {
        paylineIndex: 0,
        symbol: "wild",
        count: 3,
        amount: 20,
      },
    ]);
    expect(result.totalWin).toBe(20);
  });

  it("chooses substitution when its multiplied payout is higher", () => {
    const result = evaluateSpin(board, [TOP_PAYLINE], 1, [
      { reelIndex: 0, multiplier: 1 },
      { reelIndex: 1, multiplier: 1 },
      { reelIndex: 2, multiplier: 1 },
      { reelIndex: 4, multiplier: 3 },
    ]);

    expect(result.lineWins).toEqual([
      {
        paylineIndex: 0,
        symbol: "low-1",
        count: 5,
        amount: 30,
      },
    ]);
    expect(result.totalWin).toBe(30);
  });

  it("chooses the Wild combination when its payout is higher", () => {
    const result = evaluateSpin(board, [TOP_PAYLINE], 1, [
      { reelIndex: 0, multiplier: 3 },
      { reelIndex: 1, multiplier: 1 },
      { reelIndex: 2, multiplier: 1 },
      { reelIndex: 4, multiplier: 1 },
    ]);

    expect(result.lineWins).toEqual([
      {
        paylineIndex: 0,
        symbol: "wild",
        count: 3,
        amount: 60,
      },
    ]);
    expect(result.totalWin).toBe(60);
  });

  it("credits the multiplied free-spin win without charging a bet", () => {
    const initial = createGameSession(100);

    const session = {
      ...initial,
      bonus: {
        ...initial.bonus,
        remainingSpins: 2,
        totalWin: 12,
        stickyReels: [
          { reelIndex: 4, multiplier: 3 },
        ] as const,
      },
      bonusBet: 5,
    };

    const result = playFreeSpin(session, board);

    expect(result.spin.totalWin).toBe(150);
    expect(result.session.balance).toBe(250);
    expect(result.session.bonus.totalWin).toBe(162);
    expect(result.session.bonus.remainingSpins).toBe(1);
  });
});