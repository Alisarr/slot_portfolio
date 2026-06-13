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

 import { SymbolGenerator }
    from "./SymbolGenerator";

  import {
    PaylineEvaluator
 } from "./PaylineEvaluator";

export class SpinController {

    private startAnimation() {

    return setInterval(() => {

        const spinningSymbols = [
            this.symbolGenerator.getRandomSymbol(),
            this.symbolGenerator.getRandomSymbol(),
            this.symbolGenerator.getRandomSymbol()
        ];

        this.reelsRenderer.render(
            spinningSymbols
        );

    }, 100);

}

     private reelAnimator: ReelAnimator;

     private gameStateManager:
        GameStateManager;

     private reelsRenderer:
        ReelsRenderer;

     private winMessageRenderer:
        WinMessageRenderer;

     private symbolGenerator:
        SymbolGenerator;

     private paylineEvaluator:
        PaylineEvaluator;

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

        this.symbolGenerator =
            new SymbolGenerator();

        this.paylineEvaluator =
            new PaylineEvaluator();

    }

     async spin(): Promise<void> {

    if (
        this.gameStateManager.getState()
        === GameState.SPINNING
    ) {

        console.log("Spin blocked");

        return;

    }

    this.gameStateManager.setState(
        GameState.SPINNING
    );

    console.log("Spin started");

    this.winMessageRenderer.clear();

    const animation =
        this.startAnimation();

    await this.delay(2000);

    clearInterval(animation);

    this.gameStateManager.setState(
        GameState.RESULT
    );

    const finalSymbols = [
        this.symbolGenerator.getRandomSymbol(),
        this.symbolGenerator.getRandomSymbol(),
        this.symbolGenerator.getRandomSymbol()
    ];

    this.reelsRenderer.render(
        finalSymbols
    );

    const isWin =
        this.paylineEvaluator
            .isWinning(finalSymbols);

    if (isWin) {

        this.winMessageRenderer.showWin();

    } else {

        this.winMessageRenderer.clear();

    }

    this.gameStateManager.setState(
        GameState.IDLE
    );

}
}