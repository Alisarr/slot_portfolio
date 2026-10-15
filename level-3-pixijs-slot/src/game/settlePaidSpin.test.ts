import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import { BASE_PAYLINES } from "../core/paylines";
import { settlePaidSpin } from "./settlePaidSpin";

const losingBoard = [
  ["low-1", "low-1", "low-1"],
  ["low-2", "low-2", "low-2"],
  ["low-3", "low-3", "low-3"],
  ["low-4", "low-4", "low-4"],
  ["high-1", "high-1", "high-1"],
] as const satisfies Board;

const winningBoard = [
  ["high-1", "low-1", "high-2"],
  ["wild", "low-1", "low-2"],
  ["high-1", "low-1", "low-3"],
  ["low-2", "high-2", "high-3"],
  ["low-3", "low-4", "high-1"],
] as const satisfies Board;

describe("settlePaidSpin", () => {
  it("deducts the bet when there is no win", () => {
    const result = settlePaidSpin(
      100,
      2,
      losingBoard,
      BASE_PAYLINES,
    );

    expect(result.balance).toBe(98);
    expect(result.spin.totalWin).toBe(0);
  });

  it("deducts the bet and adds the payout", () => {
    const result = settlePaidSpin(
      100,
      2,
      winningBoard,
      BASE_PAYLINES,
    );

    expect(result.spin.totalWin).toBeCloseTo(2.8);
    expect(result.balance).toBeCloseTo(100.8);
  });

  it("rejects a spin when the balance is insufficient", () => {
    expect(() =>
      settlePaidSpin(1, 2, winningBoard, BASE_PAYLINES),
    ).toThrow("Insufficient balance");
  });

  it("rejects a zero bet", () => {
    expect(() =>
      settlePaidSpin(100, 0, losingBoard, BASE_PAYLINES),
    ).toThrow("Bet must be positive and finite");
  });

  it("rejects a paid spin without active paylines", () => {
    expect(() =>
      settlePaidSpin(100, 2, losingBoard, []),
    ).toThrow("At least one payline is required");
  });

    it("allows a bet equal to the remaining balance", () => {
  const result = settlePaidSpin( 2,2,losingBoard,BASE_PAYLINES, );

  expect(result.balance).toBe(0);
  expect(result.spin.totalWin).toBe(0);
});
});