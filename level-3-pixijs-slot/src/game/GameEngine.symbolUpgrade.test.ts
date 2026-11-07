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

const upgradeBoard = [
  ["low-1", "low-2", "low-3"],
  ["high-1", "low-4", "high-2"],
  ["low-1", "low-2", "low-4"],
  ["low-4", "high-2", "high-3"],
  ["high-2", "low-3", "low-2"],
] as const satisfies Board;

const losingBoard = [
  ["low-1", "low-1", "low-1"],
  ["low-2", "low-2", "low-2"],
  ["low-3", "low-3", "low-3"],
  ["low-4", "low-4", "low-4"],
  ["high-1", "high-1", "high-1"],
] as const satisfies Board;

describe("symbol upgrade chest reward", () => {
  it("upgrades free spins, survives a retrigger and resets before a paid spin", () => {
    let board: Board = triggerBoard;

    const game = new GameEngine(
      100,
      () => board,
      () => 2,
      () => generateChestRewards(() => 0.999),
    );

    const paid = game.spin(2);
    const chosen = game.chooseChest(4);

    expect(chosen.bonus.symbolUpgradeActive).toBe(true);
    expect(chosen.bonus.chestStatus).toBe("claimed");
    expect(chosen.bonus.remainingSpins).toBe(15);
    expect(chosen.balance).toBe(98);
    expect(paid.session.bonus.symbolUpgradeActive).toBe(false);

    expect(() => game.chooseChest(4)).toThrow(
      "No chest reward is pending",
    );

    // Улучшение создаёт три high-1 на верхней линии.
    board = upgradeBoard;
    const first = game.spin(2);

    expect(first.board[0][0]).toBe("high-1");
    expect(first.board[2][0]).toBe("high-1");
    expect(first.boardBeforeExpansion[0][0]).toBe("low-1");
    expect(upgradeBoard[0][0]).toBe("low-1");

    expect(first.spin.lineWins).toEqual([
      {
        paylineIndex: 0,
        symbol: "high-1",
        count: 3,
        amount: 2,
      },
    ]);

    expect(first.spin.totalWin).toBeCloseTo(2);
    expect(first.session.balance).toBeCloseTo(100);

    // Четыре Scatter добавляют вращения и сохраняют эффект.
    board = triggerBoard;
    const retrigger = game.spin(2);

    expect(retrigger.spin.scatterCount).toBe(4);
    expect(retrigger.session.bonus.remainingSpins).toBe(28);
    expect(retrigger.session.bonus.symbolUpgradeActive).toBe(true);
    expect(retrigger.session.bonus.chestStatus).toBe("claimed");

    board = upgradeBoard;
    expect(game.spin(2).spin.totalWin).toBeCloseTo(2);

    // Завершаем оставшиеся вращения без выигрышей.
    board = losingBoard;

    for (let index = 0; index < 27; index += 1) {
      game.spin(2);
    }

    expect(game.getSession().bonus.remainingSpins).toBe(0);
    expect(game.getSession().bonusBet).toBeNull();
    expect(game.getSession().bonus.totalWin).toBeCloseTo(4);

    // На платном вращении эта же доска уже не улучшается.
    board = upgradeBoard;
    const next = game.spin(2);

    expect(next.mode).toBe("paid");
    expect(next.board).toEqual(upgradeBoard);
    expect(next.spin.totalWin).toBe(0);
    expect(next.session.balance).toBeCloseTo(100);
    expect(next.session.bonus.symbolUpgradeActive).toBe(false);
  });
});