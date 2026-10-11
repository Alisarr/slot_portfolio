import type {Board, Payline} from "./types";
import { evaluatePaylines } from "./evaluatePayline";
import { getPaylineWin } from "./payouts";

export function getSpinWin( 
    board: Board,
    paylines: readonly Payline[],
    totalBet: number,
): number {
    if (paylines.length === 0) {
        return 0;
    }

    const lineBet = totalBet / paylines.length;
    const wins = evaluatePaylines(board, paylines);

    let totalWin = 0;

    for (const win of wins) {
        const lineWin = getPaylineWin(win, lineBet);
        totalWin += lineWin;
    }

    return totalWin;
}