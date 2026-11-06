import type { BonusState } from "./BonusState";
import {
    isBonusActive,
    isChestChoicePending,
} from "./BonusState";
import { claimChestReward } from "./claimChestReward";

export function chooseChest(
    state: BonusState,
    chestIndex: number,
): BonusState {
    if (!isBonusActive(state)) {
        throw new Error("No active bonus");
    }
    if (!isChestChoicePending(state)) {
        throw new Error("No chest reward is pending");
}
const rewards = state.chestRewards;

if (rewards === null) {
    throw new Error("Chest rewards are missing");
}
const reward  = rewards[chestIndex];

if (!Number.isInteger(chestIndex) || reward === undefined) {
    throw new Error("Chest index must be an integer from 0 to 4");
}

const nextState = claimChestReward(state, reward);

return { 
    ...nextState,
    selectedChestIndex: chestIndex,
};
}