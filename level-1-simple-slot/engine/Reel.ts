import { RNG } from "./RNG";

export class Reel {

    private rng: RNG;

    constructor(rng: RNG) {
        this.rng = rng;
    }

    spin(): string {

        const symbol = this.rng.getRandomSymbol();

        console.log("Reel result:", symbol);

        return symbol;

    }

}