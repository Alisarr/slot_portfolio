import { RNG } from "../engine/RNG";

console.log("Game started");

const reels = document.getElementById("reels");
const spinButton = document.getElementById("spinButton");

const rng = new RNG();

spinButton?.addEventListener("click", () => {

    console.log("Spin started");

    const symbol1 = rng.getRandomSymbol();
    const symbol2 = rng.getRandomSymbol();
    const symbol3 = rng.getRandomSymbol();

    if (reels) {

        reels.textContent =
            `${symbol1} ${symbol2} ${symbol3}`;

    }

});