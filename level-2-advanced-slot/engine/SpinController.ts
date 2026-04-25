import {
    GameState,
    GameStateManager
} from "./GameState";

export class SpinController {

    private gameStateManager:
        GameStateManager;

    constructor(
        gameStateManager:
            GameStateManager
    ) {

        this.gameStateManager =
            gameStateManager;

    }

    spin(): void {

        // 1 — проверяем состояние

        if (
            this.gameStateManager.getState()
            === GameState.SPINNING
        ) {

            console.log(
                "Spin blocked: already spinning"
            );

            return;

        }

        // 2 — начинаем spin

        this.gameStateManager.setState(
            GameState.SPINNING
        );

        console.log("Spin started");

        // 3 — симулируем результат

        this.gameStateManager.setState(
            GameState.RESULT
        );

        console.log("Spin result ready");

        // 4 — возвращаемся в IDLE

        this.gameStateManager.setState(
            GameState.IDLE
        );

    }

}