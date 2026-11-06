import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import type { ChestRewards } from "../bonus/ChestTypes";
import type { GameSession } from "./GameSession";
import { createBonusState } from "../bonus/BonusState";
import {
  createGameSession,
  playFreeSpin,
} from "./GameSession";
import { chooseSessionChest } from "./chooseSessionChest";

const rewards = [
  { type: "free-spins", spins: 3 },
  { type: "free-spins", spins: 5 },
  { type: "free-spins", spins: 7 },
  { type: "free-spins", spins: 10 },
  { type: "free-spins", spins: 15 },
] as const satisfies ChestRewards;

function createPendingSession(): GameSession {
  return {
    ...createGameSession(100),
    bonusBet: 2,
    bonus: {
      ...createBonusState("chest"),
      remainingSpins: 10,
      chestRewards: rewards,
    },
  };
}

describe("chooseSessionChest", () => {
  it("updates the bonus while preserving the balance and bonus bet", () => {
    const before = createPendingSession();
    const after = chooseSessionChest(before, 2);

    expect(after.bonus.remainingSpins).toBe(17);
    expect(after.bonus.selectedChestIndex).toBe(2);
    expect(after.bonus.chestStatus).toBe("claimed");

    expect(after.balance).toBe(100);
    expect(after.bonusBet).toBe(2);

    expect(before.bonus.remainingSpins).toBe(10);
    expect(before.bonus.chestStatus).toBe("pending");
  });

  it("keeps the saved session when a second choice is rejected", () => {
    let session = createPendingSession();

    session = chooseSessionChest(session, 2);
    const savedSession = session;

    expect(() => {
      session = chooseSessionChest(session, 4);
    }).toThrow("No chest reward is pending");

    expect(session).toBe(savedSession);
    expect(session.bonus.remainingSpins).toBe(17);
    expect(session.bonus.selectedChestIndex).toBe(2);
  });

  it("uses the stored bonus bet for the next free spin", () => {
    const board = [
      ["low-1", "low-2", "low-3"],
      ["low-1", "low-4", "high-1"],
      ["low-1", "high-2", "low-2"],
      ["low-4", "low-2", "high-1"],
      ["high-1", "low-3", "low-4"],
    ] as const satisfies Board;

    const session = chooseSessionChest(
      createPendingSession(),
      2,
    );

    const result = playFreeSpin(session, board);

    expect(result.spin.totalWin).toBeCloseTo(0.8);
    expect(result.session.balance).toBeCloseTo(100.8);
    expect(result.session.bonus.totalWin).toBeCloseTo(0.8);
    expect(result.session.bonus.remainingSpins).toBe(16);
    expect(result.session.bonusBet).toBe(2);
  });
});