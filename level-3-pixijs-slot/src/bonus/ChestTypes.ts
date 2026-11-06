export interface ChestReward {
    readonly type: "free-spins";
    readonly spins: number;
}

export type ChestRewards = readonly [
    ChestReward,
    ChestReward,
    ChestReward,
    ChestReward,
    ChestReward,
];