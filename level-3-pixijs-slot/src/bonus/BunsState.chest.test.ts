import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import {
  createBonusState,
  awardScatters,
  isChestChoicePending,
} from "./BonusState";
import {
  createGameSession,
  playFreeSpin,
} from "../game/GameSession";

const triggerBoard = [
  ["scatter", "low-1", "low-1"],
  ["low-2", "scatter", "low-2"],
  ["low-3", "low-3", "scatter"],
  ["low-4", "low-4", "low-4"],
  ["high-1", "high-1", "high-1"],
] as const satisfies Board;

describe("chest bonus state", () => {
  it("creates a standard bonus by default", () => {
    const bonus = createBonusState();

    expect(bonus.kind).toBe("standard");
    expect(bonus.chestStatus).toBe("not-required");
    expect(isChestChoicePending(bonus)).toBe(false);
  });

  it("keeps the chest choice pending when spins are awarded", () => {
    const bonus = awardScatters(
      createBonusState("chest"),
      triggerBoard,
    );

    expect(bonus.kind).toBe("chest");
    expect(bonus.remainingSpins).toBe(10);
    expect(bonus.chestStatus).toBe("pending");
    expect(isChestChoicePending(bonus)).toBe(true);
  });

  it("rejects a free spin while the chest choice is pending", () => {
    const session = {
      ...createGameSession(100),
      bonus: awardScatters(
        createBonusState("chest"),
        triggerBoard,
      ),
      bonusBet: 2,
    };

    expect(() => playFreeSpin(session, triggerBoard)).toThrow(
      "Choose a chest before starting free spins",
    );

    expect(session.bonus.remainingSpins).toBe(10);
    expect(session.balance).toBe(100);
  });
});