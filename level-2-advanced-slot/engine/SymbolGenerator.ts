import {SYMBOLS} from "../config/symbols.ts";

export class SymbolGenerator {

    getRandomSymbol():
        string {

        const totalWeight =
            SYMBOLS.reduce(
                (sum, symbol) =>
                    sum + symbol.weight,
                0
            );

        let random =
            Math.random()
            * totalWeight;

        for (
            const symbol
            of SYMBOLS
        ) {

            random -= symbol.weight;

            if (random <= 0) {

                return symbol.id;

            }

        }

        return SYMBOLS[0].id;

    }

}