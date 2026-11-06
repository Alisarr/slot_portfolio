import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import type { ChestRewards } from "../bonus/ChestTypes";
import { GameEngine } from "./GameEngine";

const rewards = [
  { type: "free-spins", spins: 3 },
  { type: "free-spins", spins: 5 },
  { type: "free-spins", spins: 7 },
  { type: "free-spins", spins: 10 },
  { type: "free-spins", spins: 15 },
] as const satisfies ChestRewards;

const fourScatters = [
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

describe("chest bonuses in GameEngine", () => {
  it("keeps three scatters as a standard bonus", () => {
    const board = [
      fourScatters[0],
      fourScatters[1],
      fourScatters[2],
      ["low-4", "low-4", "low-4"],
      fourScatters[4],
    ] as const satisfies Board;

    const game = new GameEngine(
      100,
      () => board,
      () => 1,
      () => {
        throw new Error("Chests must not be generated");
      },
    );

    const result = game.spin(2);

    expect(result.session.bonus.kind).toBe("standard");
    expect(result.session.bonus.remainingSpins).toBe(10);
    expect(result.session.bonus.chestRewards).toBeNull();
  });

  it("starts twenty free spins for five scatters", () => {
    const board = [
      fourScatters[0],
      fourScatters[1],
      fourScatters[2],
      fourScatters[3],
      ["scatter", "high-1", "high-1"],
    ] as const satisfies Board;

    const game = new GameEngine(
      100,
      () => board,
      () => 1,
      () => rewards,
    );

    const result = game.spin(2);

    expect(result.session.bonus.kind).toBe("chest");
    expect(result.session.bonus.remainingSpins).toBe(20);
    expect(result.session.bonus.chestStatus).toBe("pending");
    expect(result.session.bonus.chestRewards).toEqual(rewards);
  });

  it("runs a chest bonus and preserves the choice on retrigger", () => {
    const boards: readonly Board[] = [
      fourScatters,
      winningBoard,
      fourScatters,
    ];

    let boardCalls = 0;
    let chestCalls = 0;

    const game = new GameEngine(
      100,
      () => {
        const board = boards[boardCalls];

        if (board === undefined) {
          throw new Error("Test boards are exhausted");
        }

        boardCalls += 1;
        return board;
      },
      () => 1,
      () => {
        chestCalls += 1;
        return rewards;
      },
    );

    // Платное вращение запускает бонус.
    const paid = game.spin(2);

    expect(paid.mode).toBe("paid");
    expect(paid.roundId).toBe(1);
    expect(paid.session.balance).toBe(98);
    expect(paid.session.bonusBet).toBe(2);
    expect(paid.session.bonus.kind).toBe("chest");
    expect(paid.session.bonus.remainingSpins).toBe(15);
    expect(paid.session.bonus.chestStatus).toBe("pending");
    expect(chestCalls).toBe(1);

    // До выбора нельзя вращать даже следующую доску.
    expect(() => game.spin(2)).toThrow(
      "Choose a chest before starting free spins",
    );

    expect(game.getSession()).toBe(paid.session);
    expect(boardCalls).toBe(1);

    // Третий сундук добавляет семь вращений.
    const chosen = game.chooseChest(2);

    expect(chosen.balance).toBe(98);
    expect(chosen.bonusBet).toBe(2);
    expect(chosen.bonus.remainingSpins).toBe(22);
    expect(chosen.bonus.chestStatus).toBe("claimed");
    expect(chosen.bonus.selectedChestIndex).toBe(2);
    expect(boardCalls).toBe(1);
    expect(chestCalls).toBe(1);

    expect(() => game.chooseChest(4)).toThrow(
      "No chest reward is pending",
    );

    expect(game.getSession()).toBe(chosen);

    // Передаём 99 специально: фриспин использует сохранённую ставку 2.
    const free = game.spin(99);

    expect(free.mode).toBe("free");
    expect(free.roundId).toBe(2);
    expect(free.spin.totalWin).toBeCloseTo(0.8);
    expect(free.session.balance).toBeCloseTo(98.8);
    expect(free.session.bonus.remainingSpins).toBe(21);

    // Четыре Scatter внутри бонуса добавляют вращения.
    const retrigger = game.spin(2);

    expect(retrigger.mode).toBe("free");
    expect(retrigger.roundId).toBe(3);
    expect(retrigger.session.bonus.remainingSpins).toBe(35);
    expect(retrigger.session.bonus.chestStatus).toBe("claimed");
    expect(retrigger.session.bonus.selectedChestIndex).toBe(2);
    expect(retrigger.session.bonus.chestRewards).toEqual(rewards);
    expect(chestCalls).toBe(1);
    expect(boardCalls).toBe(3);
  });
});