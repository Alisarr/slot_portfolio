import type {
    Board,
    Payline,
    PaylineMatch,
    PaylinePayout,
    SpinResults,
} from "./types";
import type { StickyWildReel } from "../bonus/stickyWilds";
import { evaluatePaylines } from "./evaluatePayline";
import { getPaylineWin } from "./payouts";
import { countScatters } from "./countScatters";
import { getStickyWildMultiplier } from "../bonus/getStickyWildMultiplier";

export function evaluateSpin(
    board: Board,
    paylines: readonly Payline[],
    totalBet: number,
    stickyReels: readonly StickyWildReel[] = [],
): SpinResults {
    const scatterCount = countScatters(board);

    if (paylines.length === 0) {
        return {
            lineWins: [],
            totalWin: 0,
            scatterCount,
        };
    }

    const lineBet = totalBet / paylines.length;

    function calculatePayout(match: PaylineMatch): number {
        const baseWin = getPaylineWin(match, lineBet);
        const multuplier = getStickyWildMultiplier(
            match,
             stickyReels
            );
            return baseWin * multuplier;
    }
    const matches = evaluatePaylines(
        board,
        paylines,
        calculatePayout,
        );

    const lineWins: PaylinePayout[] = [];
    let totalWin = 0;

    for (const match of matches) {
        const amount = calculatePayout(match);

        lineWins.push({
            ...match,
            amount,
        });
    
        totalWin += amount;
    }

    return {
        lineWins,
        totalWin,
        scatterCount,
    };
}
