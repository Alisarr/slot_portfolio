import type { GameSession } from "./GameSession";
import {chooseChest} from "../bonus/chooseChest";

export function chooseSessionChest(
    session: GameSession,
    chestIndex: number,
): GameSession {
    const bonus = chooseChest(session.bonus, chestIndex);

    return {
        ...session,
        bonus,
    };
}