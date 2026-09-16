import { describe, expect, it } from "vitest";
import type { Board } from "./types";
import { countScatters, shouldTriggerBonus } from "./countScatters";

describe("countScatters", () => {
  it("counts scatters anywhere on the board", () => {
    const board = [
      ["scatter", "low-1", "low-2"],
      ["low-1", "scatter", "high-1"],
      ["low-2", "low-3", "scatter"],
      ["wild", "low-4", "high-2"],
      ["high-1", "high-2", "high-3"],
    ] as const satisfies Board;

    expect(countScatters(board)).toBe(3);

    expect(shouldTriggerBonus(board)).toBe(true);
  });

  it("does not trigger the bonus with two scatters", () => {
  const board = [
    ["scatter", "low-1", "low-2"],
    ["low-1", "scatter", "high-1"],
    ["low-2", "low-3", "low-4"],
    ["wild", "low-4", "high-2"],
    ["high-1", "high-2", "high-3"],
  ] as const satisfies Board;

  expect(countScatters(board)).toBe(2);
  expect(shouldTriggerBonus(board)).toBe(false);
 });
});