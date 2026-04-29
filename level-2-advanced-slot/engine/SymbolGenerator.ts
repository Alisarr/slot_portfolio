import { SYMBOLS }
    from "../config/symbols";

export class SymbolGenerator {

    getRandomSymbol():
        string {

        const index =
            Math.floor(
                Math.random()
                * SYMBOLS.length
            );

        return SYMBOLS[index];

    }

}