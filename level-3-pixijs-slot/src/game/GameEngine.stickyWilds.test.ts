import { describe, expect, it } from 'vitest';
import type { Board } from '../core/types';
import { countScatters } from '../core/countScatters';
import { GameEngine } from './GameEngine';

const triggerBoard = [
    ["scatter", "low-1", "low-1"],
    ["low-2", "scatter", "low-2"],
    ["low-3", "low-3", "scatter"],
    ["low-4", "low-4", "low-4"],
    ["high-1", "high-1", "high-1"],
] as const satisfies Board;

const boardWithoutWild = [
  ["low-1", "high-2", "low-3"],
  ["low-2", "low-4", "high-1"],
  ["low-1", "high-3", "low-2"],
  ["low-4", "low-2", "high-1"],
  ["high-1", "low-3", "low-4"],
] as const satisfies Board;

const boardWithWild = [
  boardWithoutWild[0],
  ["low-2", "wild", "high-1"],
  boardWithoutWild[2],
  boardWithoutWild[3],
  boardWithoutWild[4],
] as const satisfies Board;

const scatterAndWildBoard = [
  triggerBoard[0],
  ["wild", "scatter", "low-2"],
  triggerBoard[2],
  triggerBoard[3],
  triggerBoard[4],
] as const satisfies Board;

// Выдаёт заранее подготовленные доски по очереди.
function createScriptedGame(
  balance: number,
  boards: readonly Board[],
): GameEngine {
  let nextIndex = 0;

  return new GameEngine(balance, () => {
    const board = boards[nextIndex];

    if (board === undefined) {
      throw new Error("Test board sequence is exhausted");
    }

    nextIndex += 1;
    return board;
  });
}

describe("sticky Wilds during free spins", () => {
  it("expands a Wild reel and keeps it on the next free spin", () => {
    const game = createScriptedGame(100, [
      triggerBoard,
      boardWithWild,
      boardWithoutWild,
    ]);

    // Платное вращение запускает 10 фриспинов.
    game.spin(2);

    const first = game.spin(2);

    expect(first.mode).toBe("free");
    expect(first.board[1]).toEqual(["wild", "wild", "wild"]);
    expect(first.boardBeforeExpansion[1]).toEqual(
      boardWithWild[1],
    );
    expect(first.session.bonus.stickyReels).toEqual([
      { reelIndex: 1, multiplier: 1 },
    ]);
    expect(first.session.bonus.remainingSpins).toBe(9);
    expect(first.spin.totalWin).toBeCloseTo(0.8);

    // На новой доске Wild не выпал, но барабан сохранился.
    const second = game.spin(2);

    expect(second.board[1]).toEqual(["wild", "wild", "wild"]);
    expect(second.session.bonus.remainingSpins).toBe(8);
    expect(second.spin.totalWin).toBeCloseTo(0.8);
    expect(second.session.balance).toBeCloseTo(99.6);
  });

  it("counts scatters before new expansion but ignores them on locked reels", () => {
    const game = createScriptedGame(2, [
      triggerBoard,
      scatterAndWildBoard,
      scatterAndWildBoard,
    ]);

    game.spin(2);

    // Новый Wild: скаттер рядом с ним ещё учитывается.
    const first = game.spin(2);

    expect(first.spin.scatterCount).toBe(3);
    expect(countScatters(first.board)).toBe(2);
    expect(first.session.bonus.remainingSpins).toBe(19);

    // Барабан уже закреплён: скаттер под ним не учитывается.
    const second = game.spin(2);

    expect(second.spin.scatterCount).toBe(2);
    expect(second.session.bonus.remainingSpins).toBe(18);
    expect(second.session.balance).toBe(0);
  });
});


