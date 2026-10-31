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

const triggerBoard = [
  ["scatter", "low-1", "low-1"],
  ["low-2", "scatter", "low-2"],
  ["low-3", "low-3", "scatter"],
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

 it("rejects an unaffordable spin before generating a board", () => {
  let generatedBoards = 0;

  const game = new GameEngine(1, () => {
    generatedBoards += 1;
    return losingBoard;
  });

  expect(() => game.spin(2))
    .toThrow("Insufficient balance");

  expect(generatedBoards).toBe(0);
  expect(game.getSession().balance).toBe(1);
});
it("reports spin modes across a complete bonus", () => {
  let generatedBoards = 0;

  const game = new GameEngine(4, () => {
    generatedBoards += 1;

    if (generatedBoards === 1) {
      return triggerBoard;
    }

    return losingBoard;
  });

  // Первое платное вращение запускает бонус.
  const started = game.spin(2);

  expect(started.mode).toBe("paid");
  expect(started.session.balance).toBe(2);
  expect(started.session.bonus.remainingSpins).toBe(10);

  // Используем все десять бесплатных вращений.
  for (let spinNumber = 1; spinNumber <= 10; spinNumber += 1) {
    const result = game.spin(1000);

    expect(result.mode).toBe("free");
    expect(result.session.balance).toBe(2);
    expect(result.session.bonus.remainingSpins).toBe(
      10 - spinNumber,
    );
  }

  expect(game.getSession().bonusBet).toBeNull();

  // Бонус завершился — следующее вращение снова платное.
  const nextPaid = game.spin(2);

  expect(nextPaid.mode).toBe("paid");
  expect(nextPaid.session.balance).toBe(0);
  expect(nextPaid.session.bonus.remainingSpins).toBe(0);
});
});