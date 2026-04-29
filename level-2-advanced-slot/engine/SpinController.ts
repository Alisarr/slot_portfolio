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

        const spinningSymbols = [
       this.symbolGenerator.getRandomSymbol(),
       this.symbolGenerator.getRandomSymbol(),
       this.symbolGenerator.getRandomSymbol()
       ];

     this.reelsRenderer.render(
      spinningSymbols
     );

     await this.delay(2000);

        // 3 — симулируем результат

        this.gameStateManager.setState(
            GameState.RESULT
        );

        console.log("Spin result ready");

    const symbols = [
      this.symbolGenerator.getRandomSymbol(),
      this.symbolGenerator.getRandomSymbol(),
      this.symbolGenerator.getRandomSymbol()
      ];

      // показываем символы

     this.reelsRenderer.render(
     symbols
     );
 
  // проверяем выигрыш

    const isWin =
     this.paylineEvaluator
        .isWinning(symbols);

    // показываем сообщение

    if (isWin) {

     this.winMessageRenderer
        .showWin();

    }
     else {
     this.winMessageRenderer
        .clear();

    }

    this.gameStateManager.setState(
        GameState.IDLE
    );
  }
}