export class BalanceManager {

    private balance: number;
    private bet: number;

    constructor() {

        this.balance = 100;
        this.bet = 10;

    }

    placeBet(): void {

        this.balance -= this.bet;

        console.log("Bet placed:", this.bet);
        console.log("Balance:", this.balance);

    }

    addWin(): void {

        const winAmount = this.bet * 2;

        this.balance += winAmount;

        console.log("Win amount:", winAmount);
        console.log("Balance:", this.balance);

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

}