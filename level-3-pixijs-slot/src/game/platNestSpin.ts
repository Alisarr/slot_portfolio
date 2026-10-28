import type { Board } from "../core/types";
import { isBonusActive } from "../bonus/BonusState";
import type { GameSession, GameSpinResults } from "./GameSession";
import { playPaidSpin, playFreeSpin } from "./GameSession";
export function playNextSpin (
session: GameSession,
totalBet: number,
board: Board,
): GameSpinResults {
    if ( isBonusActive(session.bonus)){
        return playFreeSpin(session,board);
    }
    return playPaidSpin(session, totalBet, board);
}