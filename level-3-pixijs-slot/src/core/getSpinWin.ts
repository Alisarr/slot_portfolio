import type {Board, Payline} from "./types";
import { evaluateSpin } from "./evaluateSpin";

export function getSpinWin( 
    board: Board,
    paylines: readonly Payline[],
    totalBet: number,
): number {
    const result = evaluateSpin(board, paylines, totalBet);

    return result.totalWin;
}