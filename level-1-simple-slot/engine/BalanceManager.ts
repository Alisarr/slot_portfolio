export class BalanceManager {

    private balance: number;
    private bet: number;

    constructor() {

        this.balance = 100;
        this.bet = 10;

    }

    placeBet(): void {

        this.balance -= this.bet;

    }

    addWin(): void {

        const winAmount = this.bet * 2;

        this.balance += winAmount;

    }

    getBalance(): number {

        return this.balance;

    }

    canPlaceBet(): boolean {

    if (this.balance >= this.bet) {

        return true;

    }

    console.log("Not enough balance!");

    return false;

    }

    addWinAmount(amount: number): void {

    this.balance += amount;

    }

    reset(): void {

    this.balance = 100;

    console.log("Game reset");

    }

}