export class PaylineEvaluator {

    isWinning(
        symbols: string[]
    ): boolean {

        if (
            symbols.length !== 3
        ) {

            return false;

        }

        return (
            symbols[0] === symbols[1]
            &&
            symbols[1] === symbols[2]
        );

    }

}