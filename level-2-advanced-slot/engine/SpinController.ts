import {
    GameState,
    GameStateManager
} from "./GameState";


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

    import { SoundManager }
    from "./SoundManager";
    
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

      private soundManager:
    SoundManager;


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

            this.soundManager =
         new SoundManager();

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

        this.soundManager.playButton();

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

        this.soundManager.playButton();

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

    const betAtSpinStart = 
       this.betManager.getBet();

    if (
        !this.balanceManager
            .canPlaceBet(
                betAtSpinStart
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
       betAtSpinStart
    );

    this.soundManager.playSpin();

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

    this.soundManager.stopSpin();

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
           betAtSpinStart 
        );

        this.soundManager.playWin();

        this.winPopupRenderer.showWin(
        winAmount
        );
     setTimeout(() => {

       this.soundManager.playCoin();

       this.balanceManager.addWin(
        winAmount
        );

        this.balanceRenderer.updateBalance(
        this.balanceManager.getBalance()
        );

      }, 300);


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