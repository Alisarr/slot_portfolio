export enum GameState {

    IDLE = "IDLE",

    SPINNING = "SPINNING",

    RESULT = "RESULT",

    GAME_OVER = "GAME_OVER"

}

export class GameStateManager {

    private currentState: GameState;

    constructor() {

        this.currentState = GameState.IDLE;

    }

    getState(): GameState {

        return this.currentState;

    }

    setState(newState: GameState): void {

        console.log(
            "Game state changed:",
            this.currentState,
            "→",
            newState
        );

        this.currentState = newState;

    }

}
