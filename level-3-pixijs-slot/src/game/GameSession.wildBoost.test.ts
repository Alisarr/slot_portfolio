import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import { createBonusState } from "../bonus/BonusState";
import { claimChestReward } from "../bonus/claimChestReward";
import {
  createGameSession,
  playFreeSpin,
  playPaidSpin,
} from "./GameSession";

const boardWithoutWild = [
  ["low-1", "low-2", "low-3"],
  ["low-1", "low-4", "high-1"],
  ["low-1", "high-2", "low-2"],
  ["low-4", "low-2", "high-1"],
  ["high-1", "low-3", "low-4"],
] as const satisfies Board;

const boardWithWild = [
  boardWithoutWild[0],
  ["low-2", "wild", "high-1"],
  boardWithoutWild[2],
  boardWithoutWild[3],
  boardWithoutWild[4],
] as const satisfies Board;

describe("Wild boost reward", () => {
  it("boosts a new Wild once and resets the boost after the bonus", () => {
    // Короткий бонус на два вращения для нашей проверки.
    const before = {
      ...createBonusState("chest"),
      remainingSpins: 2,
    };

    const bonus = claimChestReward(before, {
      type: "wild-boost",
      amount: 1,
    });

    expect(bonus.wildMultiplierBoost).toBe(1);
    expect(bonus.remainingSpins).toBe(2);
    expect(bonus.winMultiplier).toBe(1);
    expect(bonus.chestStatus).toBe("claimed");
    expect(before.wildMultiplierBoost).toBe(0);

    const session = {
      ...createGameSession(100),
      bonus,
      bonusBet: 2,
    };

    let multiplierCalls = 0;

    const createMultiplier = () => {
      multiplierCalls += 1;
      return 2;
    };

    // Выпал Wild: исходный множитель 2 плюс награда 1.
    const first = playFreeSpin(
      session,
      boardWithWild,
      createMultiplier,
    );

    expect(first.session.bonus.stickyReels).toEqual([
      { reelIndex: 1, multiplier: 3 },
    ]);
    expect(first.spin.totalWin).toBeCloseTo(2.4);

    // Нового Wild нет, старый сохраняет множитель 3.
    const second = playFreeSpin(
      first.session,
      boardWithoutWild,
      createMultiplier,
    );

    expect(second.session.bonus.stickyReels).toEqual([
      { reelIndex: 1, multiplier: 3 },
    ]);
    expect(second.spin.totalWin).toBeCloseTo(2.4);
    expect(second.session.balance).toBeCloseTo(104.8);
    expect(second.session.bonus.totalWin).toBeCloseTo(4.8);
    expect(second.session.bonus.remainingSpins).toBe(0);
    expect(multiplierCalls).toBe(1);

    // После бонуса возвращаемся к обычному платному вращению.
    const next = playPaidSpin(
      second.session,
      2,
      boardWithoutWild,
    );

    expect(next.session.bonus.wildMultiplierBoost).toBe(0);
    expect(next.session.bonus.stickyReels).toEqual([]);
    expect(next.spin.totalWin).toBeCloseTo(0.8);
    expect(next.session.balance).toBeCloseTo(103.6);
  });
});