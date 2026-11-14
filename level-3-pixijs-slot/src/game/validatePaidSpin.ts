import type { Payline } from "../core/types";
import { GameError } from "../shared/GameError.ts";

export function validatePaidSpin(
    balance: number,
    totalBet: number,
    paylines: readonly Payline[],
): void {
    if ( !Number.isFinite(balance) || balance < 0 ){
        throw new Error("Balance must be non-negative and finites");
    }

    if(!Number.isFinite(totalBet) || totalBet <= 0) {
        throw new Error("Bet must be positive and finite");
    }

    if (paylines.length === 0) {
        throw new Error("At least one payline is required");
    }
    if (balance < totalBet) {
        throw new GameError("INSUFFICIENT_BALANCE",
            "Insufficient balance",  
        );
    }
    if (balance < totalBet) {
  throw new GameError(
    "INSUFFICIENT_BALANCE",
    "Insufficient balance",
  );
}
}