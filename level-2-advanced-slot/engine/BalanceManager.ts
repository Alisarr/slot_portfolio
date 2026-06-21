export class BalanceManager {

    private balance: number;

    constructor() {

        this.balance = 1000;

    }

      getBalance(): number {

        return this.balance;
    
      }

  placeBet(amount: number): void {

    this.balance -= amount;

  }

  addWin(amount: number): void {

    this.balance += amount;

  }

  canPlaceBet(
    amount: number
   ): boolean {

    return this.balance >= amount;

  }

}