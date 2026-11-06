import type { BonusState } from "./BonusState"; 
import type { ChestReward } from "./ChestTypes";
import {
    isBonusActive,
    isChestChoicePending,
} from "./BonusState";

export function claimChestReward(
    state: BonusState,
    reward: ChestReward,
): BonusState {
    if (!isBonusActive(state)) {
        throw new Error("No active bonus");
    }
    if (!isChestChoicePending(state)) {
        throw new Error("No chest reward is pending");
    }
    if (!Number.isInteger(reward.spins) || reward.spins <= 0) {
        throw new Error("Reward spins must be a positive integer");
    }

    return {
        ...state,
        remainingSpins: state.remainingSpins + reward.spins,
        chestStatus: "claimed",
    };
} 