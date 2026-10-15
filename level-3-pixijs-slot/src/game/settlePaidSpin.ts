import type { Board, Payline, SpinResults } from "../core/types";
import { evaluateSpin } from "../core/evaluateSpin";

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
    if( !Number.isFinite(balance) || balance < 0 )  {
        throw new Error("Balance must be non-negative and finite");
    }
    if( !Number.isFinite(totalBet) || totalBet <= 0) {
        throw new Error("Bet must be positive and finite");
    }
    if(paylines.length === 0) {
        throw new Error("At least one payline is required");
    }

    if (balance < totalBet){
        throw new Error("Insufficient balance");
    }

    const balanceAfterBet = balance - totalBet;
    const spin = evaluateSpin( board,paylines,totalBet );
    const nextBalance = balanceAfterBet + spin.totalWin;

    return {
        balance: nextBalance,
        spin,
    };
}