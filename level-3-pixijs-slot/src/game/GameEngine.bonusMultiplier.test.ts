import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import { GameEngine } from "./GameEngine";
import { generateChestRewards } from "../bonus/generateChestRewards";

const triggerBoard = [
  ["scatter", "low-1", "low-1"],
  ["low-2", "scatter", "low-2"],
  ["low-3", "low-3", "scatter"],
  ["scatter", "low-4", "low-4"],
  ["high-1", "high-1", "high-1"],
] as const satisfies Board;

const winningBoard = [
  ["low-1", "low-2", "low-3"],
  ["low-1", "low-4", "high-1"],
  ["low-1", "high-2", "low-2"],
  ["low-4", "low-2", "high-1"],
  ["high-1", "low-3", "low-4"],
] as const satisfies Board;

const losingBoard = [
  ["low-1", "low-1", "low-1"],
  ["low-2", "low-2", "low-2"],
  ["low-3", "low-3", "low-3"],
  ["low-4", "low-4", "low-4"],
  ["high-1", "high-1", "high-1"],
] as const satisfies Board;

describe("bonus win multipliers", () => {
  it.each([3])(
    "applies x%i once and resets it for the next bonus",
    (multiplier) => {
      let board: Board = triggerBoard;

      const game = new GameEngine(
        100,
        () => board,
        () => 1,
        () => generateChestRewards(() => 0.999),
      );

      const paid = game.spin(2);
      const chosen = game.chooseChest(1);

      // Выбор сохраняет множитель без немедленного начисления денег.
      expect(chosen.balance).toBe(98);
      expect(chosen.bonus.remainingSpins).toBe(15);
      expect(chosen.bonus.winMultiplier).toBe(multiplier);
      expect(paid.session.bonus.winMultiplier).toBe(1);

      expect(() => game.chooseChest(0)).toThrow(
        "No chest reward is pending",
      );

      // Исходный выигрыш этой доски — 0.8 при ставке 2.
      board = winningBoard;
      const first = game.spin(99);

      expect(first.mode).toBe("free");
      expect(first.spin.totalWin).toBeCloseTo(0.8 * multiplier);
      expect(first.spin.lineWins).toHaveLength(1);
      expect(first.spin.lineWins[0].amount).toBeCloseTo(
        first.spin.totalWin,
      );
      expect(first.session.balance).toBeCloseTo(
        98 + 0.8 * multiplier,
      );
      expect(first.session.bonus.totalWin).toBeCloseTo(
        0.8 * multiplier,
      );

      // Завершаем оставшиеся 14 вращений без выигрышей.
      board = losingBoard;

      for (let index = 0; index < 14; index += 1) {
        game.spin(2);
      }

      expect(game.getSession().bonus.remainingSpins).toBe(0);
      expect(game.getSession().bonusBet).toBeNull();
      expect(game.getSession().balance).toBeCloseTo(
        98 + 0.8 * multiplier,
      );

      // Новый бонус начинается без предыдущего усиления.
      board = triggerBoard;
      const next = game.spin(2);

      expect(next.mode).toBe("paid");
      expect(next.session.balance).toBeCloseTo(
        96 + 0.8 * multiplier,
      );
      expect(next.session.bonus.winMultiplier).toBe(1);
      expect(next.session.bonus.totalWin).toBe(0);
      expect(next.session.bonus.chestStatus).toBe("pending");
    },
  );
});