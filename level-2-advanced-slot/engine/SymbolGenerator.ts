import { SYMBOLS } from "../src/config/symbols";

export class SymbolGenerator {

    getRandomSymbol() {

        const totalWeight =
            SYMBOLS.reduce(
                (sum, symbol) =>
                    sum + symbol.weight,
                0
            );

        let random =
            Math.random()
            * totalWeight;

        for (const symbol of SYMBOLS) {

            random -= symbol.weight;

            if (random <= 0) {

                return symbol;

            }

        }

        return SYMBOLS[0];

    }

}