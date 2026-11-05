import { describe, expect, it } from "vitest";
import type { BonusState } from "./BonusState";
import type { Board } from "../core/types";
import { createBonusState } from "./BonusState";
import { claimChestReward } from "./claimChestReward";
import {
  createGameSession,
  playFreeSpin,
} from "../game/GameSession";

function createPendingBonus(): BonusState {
  return {
    ...createBonusState("chest"),
    remainingSpins: 10,
  };
}

describe("claimChestReward", () => {
  it("adds spins without changing the original state", () => {
    const before = createPendingBonus();

    const after = claimChestReward(before, {
      type: "free-spins",
      spins: 5,
    });

    expect(after.remainingSpins).toBe(15);
    expect(after.chestStatus).toBe("claimed");

    expect(before.remainingSpins).toBe(10);
    expect(before.chestStatus).toBe("pending");
  });

  it("rejects a second claim", () => {
    const after = claimChestReward(createPendingBonus(), {
      type: "free-spins",
      spins: 5,
    });

    expect(() =>
      claimChestReward(after, {
        type: "free-spins",
        spins: 5,
      }),
    ).toThrow("No chest reward is pending");
  });

  it("rejects a reward in a standard bonus", () => {
    const bonus = {
      ...createBonusState(),
      remainingSpins: 10,
    };

    expect(() =>
      claimChestReward(bonus, {
        type: "free-spins",
        spins: 5,
      }),
    ).toThrow("No chest reward is pending");
  });

  it("rejects a reward without an active bonus", () => {
    expect(() =>
      claimChestReward(createBonusState("chest"), {
        type: "free-spins",
        spins: 5,
      }),
    ).toThrow("No active bonus");
  });

  it("rejects invalid spin amounts", () => {
    for (const spins of [0, -1, 1.5, NaN, Infinity]) {
      expect(() =>
        claimChestReward(createPendingBonus(), {
          type: "free-spins",
          spins,
        }),
      ).toThrow("Reward spins must be a positive integer");
    }
  });

  it("allows a free spin after claiming the reward", () => {
    const board = [
      ["low-1", "low-1", "low-1"],
      ["low-2", "low-2", "low-2"],
      ["low-3", "low-3", "low-3"],
      ["low-4", "low-4", "low-4"],
      ["high-1", "high-1", "high-1"],
    ] as const satisfies Board;

    const bonus = claimChestReward(createPendingBonus(), {
      type: "free-spins",
      spins: 5,
    });

    const session = {
      ...createGameSession(100),
      bonus,
      bonusBet: 2,
    };

    const result = playFreeSpin(session, board);

    expect(result.session.bonus.remainingSpins).toBe(14);
    expect(result.session.bonus.chestStatus).toBe("claimed");
    expect(result.session.balance).toBe(100);
  });
});