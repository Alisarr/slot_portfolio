import type { Board } from "../core/types";
import { generateBoard } from "../core/generateBoard";
import type { GameSession, GameSpinResults } from "./GameSession";
import { createGameSession } from "./GameSession";
import { playNextSpin } from "./platNestSpin";
import { isBonusActive } from "../bonus/BonusState";
import { BASE_PAYLINES } from "../core/paylines";
import { validatePaidSpin } from "./validatePaidSpin";

type BoardGenerator = () => Board;

export interface EngineSpinResult extends GameSpinResults{
    readonly board  : Board;
}

export interface EngineSpinResult extends GameSpinResults {
    readonly board: Board;
    readonly mode: "paid" | "free";
}

export class GameEngine { 
    private session: GameSession;
    private createBoard: BoardGenerator;

    constructor(initialBalance: number,
        createBoard: BoardGenerator = generateBoard,
    ) {
        this.session = createGameSession(initialBalance);
        this.createBoard = createBoard;
    }
    getSession(): GameSession{
        return this.session;
    }

    spin(totalBet: number): EngineSpinResult{
        const isFreeSpin = isBonusActive(this.session.bonus);

        if (!isFreeSpin) {
            validatePaidSpin(
                this.session.balance,
                totalBet,
                BASE_PAYLINES,
            );
        }
        const board = this.createBoard();
        
        const result = playNextSpin(
            this.session,
            totalBet,
            board,
        );

        this.session = result.session;

        return {
          ...result,
          board,
          mode: isFreeSpin ? "free" : "paid",
        };
    }
}
