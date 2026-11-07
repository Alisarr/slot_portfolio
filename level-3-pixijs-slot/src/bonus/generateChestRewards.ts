import type { ChestReward, ChestRewards } from "./ChestTypes";

export function generateChestRewards(
    random: () => number = Math.random,
): ChestRewards {
    const rewards: [
        ChestReward,
        ChestReward,
        ChestReward,
        ChestReward,
        ChestReward,
    ] = [
        {type: "free-spins", spins: 5},
        {type: "bonus-multiplier", multiplier: 3},
        {type: "sticky-wild", reelIndex: 2},
        {type: "wild-boost", amount: 1},
        {type: "symbol-upgrade"},
    ];

    for (let index = rewards.length - 1; index > 0; index -= 1){
        const roll = random();

        if (!Number.isFinite(roll) || roll < 0 || roll >= 1){
            throw new Error("Random value must be >= 0 and < 1");
        }
        const swapIndex = Math.floor(roll * (index + 1));

        const currentReward = rewards[index];
        rewards[index] = rewards[swapIndex];
        rewards[swapIndex] = currentReward;
    }
    
    return rewards;
}