import type { Board } from "../core/types";
import type { ChestRewards } from "../bonus/ChestTypes";
import { isBonusActive } from "../bonus/BonusState";
import type { GameSession, GameSpinResults } from "./GameSession";
import { playPaidSpin, playFreeSpin } from "./GameSession";
import { generateChestRewards } from "../bonus/generateChestRewards";

export function playNextSpin (
session: GameSession,
totalBet: number,
board: Board,
createMultiplier: () => number = () => 1,
createChestRewards: () => ChestRewards = generateChestRewards,
): GameSpinResults {
    if ( isBonusActive(session.bonus)){
        return playFreeSpin(
            session,
            board,
            createMultiplier,
        );
    }
    return playPaidSpin(session, totalBet, board, createChestRewards,);
}