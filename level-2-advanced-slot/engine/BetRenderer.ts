export class BetRenderer {

    private betElement:
        HTMLElement;

    constructor() {

        const element =
            document.getElementById(
                "bet"
            );

        if (!element) {

            throw new Error(
                "Bet element not found"
            );

        }

        this.betElement =
            element;

    }

    updateBet(
        bet: number
    ): void {

        this.betElement.textContent =
            `Bet: ${bet}`;

    }

}