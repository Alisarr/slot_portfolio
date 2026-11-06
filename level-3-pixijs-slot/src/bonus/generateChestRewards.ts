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
        {type: "free-spins", spins: 3},
        {type: "free-spins", spins: 5},
        {type: "free-spins", spins: 7},
        {type: "free-spins", spins: 10},
        {type: "free-spins", spins: 15},
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