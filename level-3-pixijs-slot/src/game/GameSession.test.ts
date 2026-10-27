import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import { createGameSession, playPaidSpin, playFreeSpin} from "./GameSession";

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

const winningBoard = [
  ["high-1", "low-1", "high-2"],
  ["wild", "low-1", "low-2"],
  ["high-1", "low-1", "low-3"],
  ["low-2", "high-2", "high-3"],
  ["low-3", "low-4", "high-1"],
] as const satisfies Board;

describe("playFreeSpin", () => {
  it("uses the stored bet and allows a zero balance", () => {
    const initial = createGameSession(4);
    const started = playPaidSpin(initial, 4, triggerBoard);

    const result = playFreeSpin(started.session, winningBoard);

    expect(result.spin.totalWin).toBeCloseTo(5.6);
    expect(result.session.balance).toBeCloseTo(5.6);
    expect(result.session.bonus.remainingSpins).toBe(9);
    expect(result.session.bonus.totalWin).toBeCloseTo(5.6);
    expect(result.session.bonusBet).toBe(4);

    expect(started.session.balance).toBe(0);
    expect(started.session.bonus.remainingSpins).toBe(10);
    expect(started.session.bonus.totalWin).toBe(0);
  });

  it("keeps the bonus active when the last spin retriggers it", () => {
    const initial = createGameSession(100);
    const started = playPaidSpin(initial, 2, triggerBoard);

    const lastSpinSession = {
      ...started.session,
      bonus: {
        ...started.session.bonus,
        remainingSpins: 1,
      },
    };

    const result = playFreeSpin(lastSpinSession, triggerBoard);

    expect(result.session.bonus.remainingSpins).toBe(10);
    expect(result.session.bonusBet).toBe(2);
    expect(result.session.balance).toBe(98);
  });

  it("finishes the bonus without crediting its total twice", () => {
    const initial = createGameSession(100);
    let session = playPaidSpin(initial, 2, triggerBoard).session;

    for (let index = 0; index < 10; index += 1) {
      session = playFreeSpin(session, winningBoard).session;
    }

    expect(session.bonus.remainingSpins).toBe(0);
    expect(session.bonusBet).toBeNull();
    expect(session.bonus.totalWin).toBeCloseTo(28);
    expect(session.balance).toBeCloseTo(126);

    const nextPaidSpin = playPaidSpin(session, 2, losingBoard);

    expect(nextPaidSpin.session.balance).toBeCloseTo(124);
  });

  it("rejects a free spin when no bonus is active", () => {
    const session = createGameSession(100);

    expect(() =>
      playFreeSpin(session, losingBoard),
    ).toThrow("No free spins remaining");
  });
});