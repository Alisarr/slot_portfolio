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

const bonusBoard = [
  ["low-1", "low-2", "low-3"],
  ["low-1", "low-4", "high-1"],
  ["high-2", "scatter", "low-4"],
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

describe("sticky Wild chest reward", () => {
  it("locks a reel, pays its wins and clears it before the next bonus", () => {
    let board: Board = triggerBoard;
    let multiplierCalls = 0;

    const game = new GameEngine(
      100,
      () => board,
      () => {
        multiplierCalls += 1;
        return 5;
      },
      () => generateChestRewards(() => 0.999),
    );

    const paid = game.spin(2);
    const chosen = game.chooseChest(2);

    // Сундук закрепляет барабан, сохраняя число фриспинов.
    expect(chosen.bonus.stickyReels).toEqual([
      { reelIndex: 2, multiplier: 1 },
    ]);
    expect(chosen.bonus.chestStatus).toBe("claimed");
    expect(chosen.bonus.remainingSpins).toBe(15);
    expect(chosen.bonus.winMultiplier).toBe(1);
    expect(chosen.balance).toBe(98);

    // Предыдущее состояние не изменилось.
    expect(paid.session.bonus.stickyReels).toEqual([]);

    expect(() => game.chooseChest(2)).toThrow(
      "No chest reward is pending",
    );

    board = bonusBoard;
    const first = game.spin(2);

    expect(first.board[2]).toEqual(["wild", "wild", "wild"]);
    expect(first.spin.totalWin).toBeCloseTo(0.8);
    expect(first.session.balance).toBeCloseTo(98.8);

    // Scatter на уже закреплённом барабане закрыт Wild.
    expect(first.spin.scatterCount).toBe(0);

    // Исходную доску мы не изменили.
    expect(bonusBoard[2]).toEqual([
      "high-2", "scatter", "low-4",
    ]);

    const second = game.spin(2);

    expect(second.board[2]).toEqual(["wild", "wild", "wild"]);
    expect(second.session.bonus.stickyReels).toEqual([
      { reelIndex: 2, multiplier: 1 },
    ]);
    expect(second.session.bonus.remainingSpins).toBe(13);
    expect(second.session.balance).toBeCloseTo(99.6);

    // Закреплённый барабан не получает случайный множитель заново.
    expect(multiplierCalls).toBe(0);

    board = losingBoard;

    for (let index = 0; index < 13; index += 1) {
      game.spin(2);
    }

    expect(game.getSession().bonus.remainingSpins).toBe(0);
    expect(game.getSession().bonusBet).toBeNull();

    board = triggerBoard;
    const next = game.spin(2);

    expect(next.mode).toBe("paid");
    expect(next.board).toEqual(triggerBoard);
    expect(next.session.bonus.stickyReels).toEqual([]);
    expect(next.session.balance).toBeCloseTo(97.6);
  });
});