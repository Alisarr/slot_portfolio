export type ChestReward = 
| {
    readonly type: "free-spins";
    readonly spins: number;
}
|{
    readonly type: "bonus-multiplier";
    readonly multiplier: number;
};

export type ChestRewards = readonly [
    ChestReward,
    ChestReward,
    ChestReward,
    ChestReward,
    ChestReward,
];