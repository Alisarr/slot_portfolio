import {
    GameState,
    GameStateManager
} from "./GameState";

import { ReelAnimator }
    from "./ReelAnimator";

import {
    ReelsRenderer
 } from "./ReelsRenderer";

import {
    WinMessageRenderer
 } from "./WinMessageRenderer";

export class SpinController {

     private reelAnimator: ReelAnimator;

     private gameStateManager:
        GameStateManager;

     private reelsRenderer:
        ReelsRenderer;

     private winMessageRenderer:
        WinMessageRenderer;

    private delay(
      ms: number
     ): Promise<void> {

      return new Promise(
        resolve =>
        setTimeout(
         resolve,
         ms
        )
    );

}

    constructor(
        gameStateManager:
            GameStateManager
    ) {

        this.gameStateManager =
            gameStateManager;

        this.reelAnimator =
            new ReelAnimator();

        this.reelsRenderer =
            new ReelsRenderer();

        this.winMessageRenderer =
            new WinMessageRenderer();

    }

     async spin(): Promise<void> {

        if (
            this.gameStateManager.getState()
            === GameState.SPINNING
        ) {

            console.log(
                "Spin blocked"
            );

            return;

        }
        // 2 — начинаем spin

        this.gameStateManager.setState(
            GameState.SPINNING
        );

        console.log("Spin started");

        this.winMessageRenderer.clear();

        this.reelsRenderer.render([
        "🎰",
        "🎰",
        "🎰"
        ]);

     await this.delay(2000);

        // 3 — симулируем результат

        this.gameStateManager.setState(
            GameState.RESULT
        );

        console.log("Spin result ready");

        this.reelsRenderer.render([
        "🍋",
        "🍒",
        "🍊"
        ]);

        const isWin =
     Math.random() > 0.5;

     if (isWin) {

      this.winMessageRenderer.showWin();
     }

     else {
      this.winMessageRenderer.clear();
     }

         

        // 4 — возвращаемся в IDLE

        this.gameStateManager.setState(
            GameState.IDLE
        );


    }


}