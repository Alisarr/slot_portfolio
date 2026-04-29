import type { SymbolConfig }
    from "../src/config/symbols";

export class PaylineEvaluator {

    isWinning(
        symbols: SymbolConfig[]
    ): boolean {

        if (symbols.length !== 3) {

            return false;

        }

        return (

            symbols[0].id === symbols[1].id
            &&
            symbols[1].id === symbols[2].id

        );

    }

}