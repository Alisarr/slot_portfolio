import type { Board, Payline, SpinResults } from "../core/types";
import { evaluateSpin } from "../core/evaluateSpin";
import { validatePaidSpin } from "./validatePaidSpin";

export interface PaidSpinResult {
    readonly balance: number;
    readonly spin: SpinResults;
}

export function settlePaidSpin(
    balance: number,
    totalBet: number,
    board: Board,
    paylines: readonly Payline[],
): PaidSpinResult {
    validatePaidSpin(balance, totalBet, paylines);

    const balanceAfterBet = balance - totalBet;
    const spin = evaluateSpin( board,paylines,totalBet );
    const nextBalance = balanceAfterBet + spin.totalWin;

    return {
        balance: nextBalance,
        spin,
    };
}