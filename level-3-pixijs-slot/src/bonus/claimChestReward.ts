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
    if(reward.type === "free-spins"){
    if (!Number.isInteger(reward.spins) || reward.spins <= 0) {
        throw new Error("Reward spins must be a positive integer");
    }
    return {
        ...state,
        remainingSpins: state.remainingSpins + reward.spins,
        chestStatus: "claimed",
    };
}

if (reward.type == "sticky-wild") {
    const reelIndex = reward.reelIndex;
    

  if (!Number.isInteger(reelIndex) || reelIndex < 0 || reelIndex > 4) {
    throw new Error("Reward reel index must be an integer from 0 to 4");
  }
  const alreadySticky = state.stickyReels.some(
    (reel) => reel.reelIndex === reelIndex,
  );
  
if(alreadySticky) {
    throw new Error("Reward reel is already sticky");
}
return {
    ...state,
    stickyReels: [
        ...state.stickyReels,
        { reelIndex, multiplier: 1},
    ],
    chestStatus: "claimed",
};
}

if( reward.type === "wild-boost"){
    if( reward.amount !== 1) {
        throw new Error("Wild multiplier boost mest be 1");
    }

    return {
        ...state,
        wildMultiplierBoost: reward.amount,
        chestStatus: "claimed",
    };
}

if (reward.type === "symbol-upgrade"){
    return {
        ...state,
        symbolUpgradeActive: true,
        chestStatus: "claimed",
    };
}
if (reward.multiplier !== 3) {
    throw new Error("Bonus multiplier must be 3");
}

    return {
        ...state,
       winMultiplier: reward.multiplier,

        chestStatus: "claimed",
    };
} 