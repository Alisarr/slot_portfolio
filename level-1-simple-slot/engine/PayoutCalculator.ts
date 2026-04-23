import { payouts } from "../config/payouts";

export class PayoutCalculator {

    calculate(symbol: string): number {

        const payout = payouts[symbol];

        if (payout) {

            console.log(
                "Payout for",
                symbol,
                "=",
                payout
            );

            return payout;

        }

        return 0;

    }

}