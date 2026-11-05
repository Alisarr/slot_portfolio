import { describe, expect, it } from "vitest";
import type { Board } from "../core/types";
import { GameEngine } from "./GameEngine";

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

function boardInOrder(boards: readonly Board[]): () => Board{
    let index = 0;

    return () => {
        const board = boards[index];

    if (board === undefined) {
        throw new Error("Test board sequence is exhausted");
    }

    index += 1;
    return board;
};
}

describe ("Wild multiplier generation in GameENgine", () => {
    it("assigns a multiplier once keeps it on the next free spin", () => {
        let calls = 0;

        const game = new GameEngine(
            100,
            boardInOrder([
                triggerBoard,
                boardWithWild,
                boardWithoutWild,
            ]),
            () => {
                calls += 1;
                return 3;
            },
        );

        game.spin(2);
        expect(calls).toBe(0);

        const first = game.spin(2);

        expect(first.session.bonus.stickyReels).toEqual([
            { reelIndex: 1, multiplier: 3},
        ]);
        expect(first.spin.totalWin).toBeCloseTo(2.4);
        expect(first.session.balance).toBeCloseTo(100.4);

        const second = game.spin(2);

        expect(second.session.bonus.stickyReels).toEqual([
            {reelIndex: 1, multiplier: 3},
        ]);
        expect(second.spin.totalWin).toBeCloseTo(2.4);
        expect(second.session.balance).toBeCloseTo(102.8);

        expect(calls).toBe(1);
    });

    it("draws once per new reel wven when a reel contains several Wilds", () => {
        const twoWildReels = [
            boardWithoutWild[0],
            ["wild", "wild", "wild"],
            boardWithoutWild[2],
            ["low-4", "wild", "high-1"],
            boardWithoutWild[4],
        ] as const satisfies Board;

        let calls = 0;

        const game = new GameEngine(
            100,
            boardInOrder([triggerBoard, twoWildReels]),
            () => {
                calls += 1;
                return calls === 1 ? 2 : 5;
            },
        );

        game.spin(2);
        const result = game.spin(2);

        expect(result.session.bonus.stickyReels).toEqual([
            {reelIndex: 1, multiplier: 2},
            {reelIndex: 3, multiplier: 5},
        ]);
        expect(calls).toBe(2);
    });

    it("uses the weighted generator by default", () => {
        const game = new GameEngine(
            100,
            boardInOrder([triggerBoard, boardWithWild]),
        );

        game.spin(2);
        const result = game.spin(2);

        expect(result.session.bonus.stickyReels).toHaveLength(1);

        const multiplier = 
        result.session.bonus.stickyReels[0]?.multiplier;

        expect([2, 3, 5]).toContain(multiplier);
    });
});