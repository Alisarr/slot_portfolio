import type { SymbolConfig }
    from "../src/config/symbols";

export class PayoutCalculator {

    calculateWin(
        symbols: SymbolConfig[],
        betAmount: number
    ): number {

        const symbolId =
            symbols[0].id;

        switch (symbolId) {

            case "lemon":
                return betAmount * 2;

            case "cherry":
                return betAmount * 5;

            case "apple":
                return betAmount * 4;

            case "diamond":
                return betAmount * 10;

            case "seven":
                return betAmount * 25;

            default:
                return 0;

        }

    }

}