export class BalanceRenderer {

    private balanceElement:
        HTMLElement;

    constructor() {

        const element =
            document.getElementById(
                "balance"
            );

        if (!element) {

            throw new Error(
                "Balance element not found"
            );

        }

        this.balanceElement =
            element;

    }

    updateBalance(
        balance: number
    ): void {

        this.balanceElement.textContent =
            `💰 ${balance}`;

    }

}