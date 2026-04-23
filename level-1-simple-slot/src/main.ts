import { RNG } from "../engine/RNG";
import { Reel } from "../engine/Reel";
import { PaylineEvaluator } from "../engine/PaylineEvaluator";
import { BalanceManager } from "../engine/BalanceManager";
import { PayoutCalculator } from "../engine/PayoutCalculator";

const reelsView = document.getElementById("reels");
const spinButton = document.getElementById("spinButton");
const balanceView = document.getElementById("balance");
const gameOverView = document.getElementById("gameOver");

const rng = new RNG();

const reel1 = new Reel(rng);
const reel2 = new Reel(rng);
const reel3 = new Reel(rng);

const paylineEvaluator = new PaylineEvaluator();
const balanceManager = new BalanceManager();
const payoutCalculator = new PayoutCalculator();

function updateBalance() {

    if (balanceView) {

        balanceView.textContent =
            "Balance: " + balanceManager.getBalance();

    }

    if (balanceManager.getBalance() <= 0) {

        if (spinButton) {

            spinButton.setAttribute("disabled", "true");

        }

        if (gameOverView) {

            gameOverView.textContent = "Game Over";

        }

    }

}

updateBalance();

spinButton?.addEventListener("click", () => {

  if (!balanceManager.canPlaceBet()) {

    console.log("Spin blocked");

    return;

}

    console.log("Spin started");

    balanceManager.placeBet();

    updateBalance();

    const symbol1 = reel1.spin();
    const symbol2 = reel2.spin();
    const symbol3 = reel3.spin();

    if (reelsView) {

        reelsView.textContent =
            `${symbol1} ${symbol2} ${symbol3}`;

    }

    const isWin = paylineEvaluator.checkWin(
        symbol1,
        symbol2,
        symbol3
    );

    if (isWin) {

    const payout =
        payoutCalculator.calculate(symbol1);

    balanceManager.addWinAmount(payout);

    updateBalance();

    }
});