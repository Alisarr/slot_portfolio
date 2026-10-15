import type { Board, SpinResults } from "../core/types";
import type { BonusState } from "../bonus/BonusState";
import {
    createBonusState,
    awardScatters,
    isBonusActive,
} from "../bonus/BonusState";
import { BASE_PAYLINES } from "../core/paylines";
import { settlePaidSpin } from "./settlePaidSpin";

export interface GameSession {
    readonly balance: number;
    readonly bonus: BonusState;
    readonly bonusBet: number | null;
}

export interface GameSpinResults {
    readonly session: GameSession;
    readonly spin: SpinResults;
}

export function createGameSession(balance: number): GameSession{
    if (!Number.isFinite(balance) || balance < 0) {
        throw new Error("Balance must be non-negative and finite");
    }
 return {
    balance,
    bonus: createBonusState(),
    bonusBet: null,
 };
}

export function playPaidSpin(
    session: GameSession,
    totalBet: number,
    board: Board,
): GameSpinResults{
    if(isBonusActive(session.bonus)) {
        throw new Error("Cannot start a paid spin during a bonus");
    }

    const paidResult = settlePaidSpin(
        session.balance,
        totalBet,
        board,
        BASE_PAYLINES,
    );

 const bonus = awardScatters(createBonusState(), board);
 const bonusBet = isBonusActive(bonus) ? totalBet : null;

 return{
    session: {
        ...session,
        balance: paidResult.balance,
        bonus,
        bonusBet,
    },
    spin: paidResult.spin,
 };
}