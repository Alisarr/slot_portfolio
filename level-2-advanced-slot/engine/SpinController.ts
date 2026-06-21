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

 import { BalanceManager }
    from "./BalanceManager";
    
 import {
    BalanceRenderer
 } from "./BalanceRenderer"
    
export class SpinController {

    private spinButton:
    HTMLButtonElement;

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

     private balanceManager:
       BalanceManager;

     private balanceRenderer:
        BalanceRenderer;

        private readonly betAmount =
      10;

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

            this.balanceManager =
         new BalanceManager();

          this.balanceRenderer = 
         new BalanceRenderer();

         this.balanceRenderer.updateBalance(
         this.balanceManager.getBalance()
         );

        const button =
         document.getElementById(
         "spinButton"
          );

        if (!button) {

        throw new Error(
         "Spin button not found"
         );

      }

     this.spinButton =
     button as HTMLButtonElement;    

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

    if (
        !this.balanceManager
            .canPlaceBet(
                this.betAmount
            )
    ) {

        console.log(
            "Not enough balance"
        );

        return;

    }

    this.gameStateManager.setState(
        GameState.SPINNING
    );

    this.balanceManager.placeBet(
        this.betAmount
    );

    this.balanceRenderer.updateBalance(
        this.balanceManager.getBalance()
    );

    this.spinButton.disabled =
        true;

    console.log(
        "Spin started"
    );

    this.winMessageRenderer.clear();

    const animation =
        this.startAnimation();

    await this.delay(2000);

    clearInterval(
        animation
    );

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
            .isWinning(
                finalSymbols
            );

    if (isWin) {

        const winAmount =
            this.betAmount * 5;

        this.balanceManager.addWin(
            winAmount
        );

        this.balanceRenderer.updateBalance(
            this.balanceManager.getBalance()
        );

        this.winMessageRenderer.showWin();

    } else {

        this.winMessageRenderer.clear();

    }

    this.gameStateManager.setState(
        GameState.IDLE
    );

    this.spinButton.disabled =
        false;

}
}