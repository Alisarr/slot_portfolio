export class PaylineEvaluator {

    checkWin(
        symbol1: string,
        symbol2: string,
        symbol3: string
    ): boolean {

        if (
            symbol1 === symbol2 &&
            symbol2 === symbol3
        ) {

            console.log("WIN!");

            return true;

        }

        console.log("No win");

        return false;

    }

}