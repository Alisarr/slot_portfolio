import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import { GameEngine } from "./GameEngine";

const losingBoard = [
  ["low-1", "low-1", "low-1"],
  ["low-2", "low-2", "low-2"],
  ["low-3", "low-3", "low-3"],
  ["low-4", "low-4", "low-4"],
  ["high-1", "high-1", "high-1"],
] as const satisfies Board;

describe("GameEngine", () => {
  it("remembers the updated balance between spins", () => {
    const game = new GameEngine(4, () => losingBoard);

    const first = game.spin(2);

    expect(first.board).toEqual(losingBoard);
    expect(first.session.balance).toBe(2);

    const second = game.spin(2);

    expect(second.session.balance).toBe(0);
    expect(game.getSession().balance).toBe(0);
  });

  it("keeps the balance unchanged when a spin is rejected", () => {
    const game = new GameEngine(1, () => losingBoard);

    expect(() => game.spin(2))
      .toThrow("Insufficient balance");

    expect(game.getSession().balance).toBe(1);
  });
});