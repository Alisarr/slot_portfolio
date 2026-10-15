import type {
    Board,
    Payline,
    PaylinePayout,
    SpinResults,
} from "./types";
import { evaluatePaylines } from "./evaluatePayline";
import { getPaylineWin } from "./payouts";
import { countScatters } from "./countScatters";

export function evaluateSpin(
    board: Board,
    paylines: readonly Payline[],
    totalBet: number,
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
    const matches = evaluatePaylines(board, paylines);

    const lineWins: PaylinePayout[] = [];
    let totalWin = 0;

    for (const match of matches) {
        const amount = getPaylineWin(match, lineBet);

        lineWins.push({
            ...match,
            amount,
        });
    
        totalWin += amount;
    }

    return {
        lineWins,
        totalWin: totalWin,
        scatterCount,
    };
}
