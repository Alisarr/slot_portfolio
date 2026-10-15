import { describe, expect, it } from "vitest";
import type { Board } from "./types";
import { BASE_PAYLINES } from "./paylines";
import { evaluateSpin } from "./evaluteSpin";

const board = [
    ["high-1", "low-1", "scatter"],
["wild", "low-1", "low-2"],
["high-1", "low-1", "low-3"],
["low-2", "high-2", "scatter"],
["low-3", "scatter", "high-1"],
] as const satisfies Board;

describe("evaluateSpin", () => {
    it("returns winning lines with their payouts and total win",() => {
        const result = evaluateSpin(board, BASE_PAYLINES, 2);

        expect(result.lineWins).toEqual([
            {
                paylineIndex: 0,
                symbol: "high-1",
                count: 3,
                amount:2,
            },
            {
                paylineIndex: 1,
                symbol: "low-1",
                count: 3,
              amount: 0.8,
            },
        ]);
        expect(result.totalWin).toBeCloseTo(2.8);
    });

    it("counts scatters alonginside line wins", () => {
        const results = evaluateSpin(board, BASE_PAYLINES, 2);

        expect(results.scatterCount).toBe(3);
        expect(results.totalWin).toBeCloseTo(2.8);
    });

    it("returns zero when no lines win", () => {
        const losingBoard = [
            ["low-1", "low-1", "low-1"],
            ["low-2", "low-2", "low-2"],
            ["low-3", "low-3", "low-3"],
            ["low-4", "low-4", "low-4"],
            ["high-1", "high-1", "high-1"],
        ] as const satisfies Board;

        const results = evaluateSpin(losingBoard, BASE_PAYLINES, 2);

        expect(results).toEqual({
            lineWins: [],
            totalWin: 0,
            scatterCount: 0,
        });
});

it("still counts scatters when there are no active paylines", () => {
const results = evaluateSpin(board, [], 2);

expect(results).toEqual({
    lineWins: [],
    totalWin: 0,
    scatterCount: 3,
});
});
});

