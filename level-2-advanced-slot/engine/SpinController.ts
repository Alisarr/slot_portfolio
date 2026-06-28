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

 import { PayoutCalculator }
    from "./PayoutCalculator";

    import { BetManager }
    from "./BetManager";

    import { BetRenderer }
    from "./BetRenderer";

    import {
    WinPopupRenderer
    } from "./WinPopupRenderer";
    
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

     private winPopupRenderer:
        WinPopupRenderer;

     private symbolGenerator:
        SymbolGenerator;

     private paylineEvaluator:
        PaylineEvaluator;

     private balanceManager:
       BalanceManager;

     private balanceRenderer:
        BalanceRenderer;

     private betRenderer:
        BetRenderer;

     private payoutCalculator:
        PayoutCalculator;

     private betManager:
        BetManager;

        private increaseBetButton:
       HTMLButtonElement;

      private decreaseBetButton:
      HTMLButtonElement;


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

        this.winPopupRenderer =
          new WinPopupRenderer();

        this.symbolGenerator =
            new SymbolGenerator();

        this.paylineEvaluator =
            new PaylineEvaluator();

            this.balanceManager =
         new BalanceManager();

            this.betManager =
         new BetManager();

          this.balanceRenderer = 
         new BalanceRenderer();

         this.balanceRenderer.updateBalance(
         this.balanceManager.getBalance()
         );

         this.betRenderer =
           new BetRenderer();

          this.betRenderer.updateBet(
          this.betManager.getBet()
           );

        this.payoutCalculator =
          new PayoutCalculator();

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

      const increaseButton =
       document.getElementById(
        "increaseBet"
       );

     const decreaseButton =
       document.getElementById(
        "decreaseBet"
      );

      if (
      !increaseButton ||
      !decreaseButton
      ) {

      throw new Error(
        "Bet buttons not found"
      );
    }

    this.increaseBetButton =
    increaseButton as HTMLButtonElement;

    this.decreaseBetButton =
    decreaseButton as HTMLButtonElement;
    
    this.increaseBetButton
    .addEventListener(
        "click",
        () => {

            this.betManager
                .increaseBet();

            this.betRenderer
                .updateBet(
                    this.betManager
                        .getBet()
                );

        }
    );

    this.decreaseBetButton
    .addEventListener(
        "click",
        () => {

            this.betManager
                .decreaseBet();

            this.betRenderer
                .updateBet(
                    this.betManager
                        .getBet()
                );

        }
    );

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
                this.betManager.getBet()
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
       this.betManager.getBet()
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
          this.payoutCalculator
         .calculateWin(
            finalSymbols,
            this.betManager.getBet()
        );

        this.balanceManager.addWin(
            winAmount
        );

        this.balanceRenderer.updateBalance(
            this.balanceManager.getBalance()
        );

        this.winPopupRenderer.showWin(
        winAmount
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