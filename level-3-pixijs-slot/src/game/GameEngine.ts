import type { Board } from "../core/types";
import { generateBoard } from "../core/generateBoard";
import type { GameSession, GameSpinResults } from "./GameSession";
import { createGameSession } from "./GameSession";
import { playNextSpin } from "./platNestSpin";

type BoardGenerator = () => Board;

export interface EngineSpinResult extends GameSpinResults{
    readonly board  : Board;
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
        };
    }
}
