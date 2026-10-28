import type { Board } from "../core/types";
import type { GameSession, GameSpinResults } from "./GameSession";
import { createGameSession } from "./GameSession";
import { playNextSpin } from "./platNestSpin";

export class GameEngine { 
    private session: GameSession;

    constructor(initialBalance: number) {
        this.session = createGameSession(initialBalance);
    }
    getSession(): GameSession{
        return this.session;
    }

    spin(totalBet: number, board: Board): GameSpinResults{
        const result = playNextSpin(
            this.session,
            totalBet,
            board,
        );

        this.session = result.session;

        return result;
    }
}
