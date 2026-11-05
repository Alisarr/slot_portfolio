import type { Board } from "../core/types";
import { generateBoard } from "../core/generateBoard";
import type { GameSession, GameSpinResults } from "./GameSession";
import { createGameSession } from "./GameSession";
import { playNextSpin } from "./platNestSpin";
import { isBonusActive,
         isChestChoicePending,
     } from "../bonus/BonusState";
import { BASE_PAYLINES } from "../core/paylines";
import { validatePaidSpin } from "./validatePaidSpin";
import { generateWildMultiplier } from "../bonus/generateWildMultiplier";

type BoardGenerator = () => Board;

export interface EngineSpinResult extends GameSpinResults{
    readonly board  : Board;
}

export interface EngineSpinResult extends GameSpinResults {
    readonly mode: "paid" | "free";
    readonly roundId: number;
}

export class GameEngine { 
    private session: GameSession;
    private createBoard: BoardGenerator;
    private createMultiplier: () => number;
    private completeSpins = 0;

    constructor(initialBalance: number,
        createBoard: BoardGenerator = generateBoard,
        createMultiplier: () => number = generateWildMultiplier,
    ) {
        this.session = createGameSession(initialBalance);
        this.createBoard = createBoard;
        this.createMultiplier = createMultiplier;
    }
    getSession(): GameSession{
        return this.session;
    }

    spin(totalBet: number): EngineSpinResult{
        const isFreeSpin = isBonusActive(this.session.bonus);

        if (isFreeSpin && isChestChoicePending(this.session.bonus)) {
            throw new Error("Choose a chest before starting free spins");
        }

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
            this.createMultiplier,
        );

        this.session = result.session;
        this.completeSpins += 1;

        return {
          ...result,
          mode: isFreeSpin ? "free" : "paid",
          roundId: this.completeSpins,
        };
    }
}
