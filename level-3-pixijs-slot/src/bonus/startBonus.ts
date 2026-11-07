import type { BonusState } from "./BonusState";
import type { ChestRewards } from "./ChestTypes";
import { createBonusState } from "./BonusState";
import { getFreeSpinsAward } from "./getFreeSpinsAward";
import { generateChestRewards } from "./generateChestRewards";

export function startBonus(
    scatterCount: number,
    createChestRewards: () => ChestRewards = generateChestRewards,
): BonusState {
    const kind = scatterCount >= 4 ? "chest" : "standard";

    return {
        ...createBonusState(kind),
        remainingSpins: getFreeSpinsAward(scatterCount),
        chestRewards: kind === "chest" ? createChestRewards() : null,
    };
}