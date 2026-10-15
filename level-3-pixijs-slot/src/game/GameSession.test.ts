import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import { createGameSession, playPaidSpin } from "./GameSession";
import { BASE_PAYLINES } from "../core/paylines";

const losingBoard = [
  ["low-1", "low-1", "low-1"],
  ["low-2", "low-2", "low-2"],
  ["low-3", "low-3", "low-3"],
  ["low-4", "low-4", "low-4"],
  ["high-1", "high-1", "high-1"],
] as const satisfies Board;

const triggerBoard = [
  ["scatter", "low-1", "low-1"],
  ["low-2", "scatter", "low-2"],
  ["low-3", "low-3", "scatter"],
  ["low-4", "low-4", "low-4"],
  ["high-1", "high-1", "high-1"],
] as const satisfies Board;

describe("GameSession", () => {
  it("settles a paid spin without starting a bonus", () => {
    const session = createGameSession(100);

    const result = playPaidSpin(session, 2, losingBoard);

    expect(result.session.balance).toBe(98);
    expect(result.session.bonus.remainingSpins).toBe(0);
    expect(result.session.bonusBet).toBeNull();
    expect(result.spin.totalWin).toBe(0);
  });

  it("starts a bonus and stores the triggering bet", () => {
    const before = createGameSession(100);

    const result = playPaidSpin(before, 2, triggerBoard);

    expect(result.session.balance).toBe(98);
    expect(result.session.bonus.remainingSpins).toBe(10);
    expect(result.session.bonus.totalWin).toBe(0);
    expect(result.session.bonusBet).toBe(2);
    expect(result.spin.scatterCount).toBe(3);

    expect(before.balance).toBe(100);
    expect(before.bonus.remainingSpins).toBe(0);
    expect(before.bonusBet).toBeNull();
  });

  it("rejects a paid spin while a bonus is active", () => {
    const initial = createGameSession(100);
    const started = playPaidSpin(initial, 2, triggerBoard);

    expect(() =>
      playPaidSpin(started.session, 2, losingBoard),
    ).toThrow("Cannot start a paid spin during a bonus");
  });

  it("4 proverka", () => {
    const before = createGameSession(100);
    const result = playPaidSpin(before, 4, triggerBoard);

    expect(result.session.balance).toBe(96);
    expect(result.session.bonusBet).toBe(4);
    expect(result.session.bonus.remainingSpins).toBe(10);
  });
});