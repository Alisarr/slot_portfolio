import { RNG } from "../engine/RNG";
import { Reel } from "../engine/Reel";

console.log("Game started");

const reelsView = document.getElementById("reels");
const spinButton = document.getElementById("spinButton");

const rng = new RNG();

const reel1 = new Reel(rng);
const reel2 = new Reel(rng);
const reel3 = new Reel(rng);

spinButton?.addEventListener("click", () => {

    console.log("Spin started");

    const symbol1 = reel1.spin();
    const symbol2 = reel2.spin();
    const symbol3 = reel3.spin();

    if (reelsView) {

        reelsView.textContent =
            `${symbol1} ${symbol2} ${symbol3}`;

    }

});