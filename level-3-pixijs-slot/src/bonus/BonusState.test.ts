import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import {
  createBonusState,
  awardScatters,
  resolveFreeSpin,
  isBonusActive,
} from "./BonusState";

const board: Board = [
  ["scatter", "low-1", "low-2"],
  ["low-1", "scatter", "high-1"],
  ["low-2", "low-3", "scatter"],
  ["wild", "low-4", "high-2"],
  ["high-1", "high-2", "high-3"],
];

describe("bonus state", () => {
  it("awards spins without changing the previous state", () => {
    const initial = createBonusState();
    const started = awardScatters(initial, board);

    expect(initial.remainingSpins).toBe(0);
    expect(started.remainingSpins).toBe(10);
  });

  it("retriggers on the last spin and accumulates winnings", () => {
    const before = {
      ...createBonusState(),
      remainingSpins: 1,
      totalWin: 25,
    };

    const after = resolveFreeSpin(before, board, 8);

    expect(after.remainingSpins).toBe(10);
    expect(after.totalWin).toBe(33);
    expect(before.remainingSpins).toBe(1);
    expect(before.totalWin).toBe(25);
  });

  const boardWithoutScatters: Board = [
  ["low-1", "low-2", "low-3"],
  ["low-2", "high-1", "low-4"],
  ["high-1", "low-3", "high-2"],
  ["wild", "low-4", "high-2"],
  ["high-1", "high-2", "high-3"],
];

  it("finishes the bonus and keeps its total winnings", () => {
  let state = awardScatters(createBonusState(), board);

  expect(isBonusActive(state)).toBe(true);

  for (let spin = 0; spin < 10; spin += 1) {
    state = resolveFreeSpin(state, boardWithoutScatters, 2);
  }

  expect(state.remainingSpins).toBe(0);
  expect(state.totalWin).toBe(20);
  expect(isBonusActive(state)).toBe(false);
});

it("rejects a free spin when none remain", () => {
  const state = createBonusState();

  expect(() => resolveFreeSpin(state, boardWithoutScatters, 2))
    .toThrow("No free spins remaining");
});
  });