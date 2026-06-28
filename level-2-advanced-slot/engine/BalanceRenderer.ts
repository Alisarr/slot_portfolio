export class BalanceRenderer {

    private balanceElement:
        HTMLElement;

    private displayedBalance:
        number;

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

        this.displayedBalance = 0;
    }

    updateBalance(
    balance: number
): void {

    this.animateBalance(
    balance
);

}

 private renderBalance(): void {

    this.balanceElement.textContent =
        `💰 ${this.displayedBalance}`;

}

private animateBalance(
    targetBalance: number
): void {

const difference =
    targetBalance -
    this.displayedBalance;

     if (difference === 0) {

        return;

    }

 const step =
    Math.ceil(
       Math.abs(difference) / 30
    ); 
    
    const interval =
        setInterval(() => {

            if (
                this.displayedBalance <
                targetBalance
            ) {

                this.displayedBalance =
                    Math.min(
                        this.displayedBalance + step,
                        targetBalance
                    );

            } else {

                this.displayedBalance =
                    Math.max(
                        this.displayedBalance - step,
                        targetBalance
                    );

            }

            this.renderBalance();

            if (
                this.displayedBalance ===
                targetBalance
            ) {

                clearInterval(
                    interval
                );
                
              this.animateBalanceEffect();
            }

        }, 15);

}

private animateBalanceEffect(): void {

    this.balanceElement.classList.add(
        "balance-update"
    );

    setTimeout(() => {

        this.balanceElement.classList.remove(
            "balance-update"
        );

    }, 350);

}



}