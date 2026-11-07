export type ChestReward = 
| {
    readonly type: "free-spins";
    readonly spins: number;
}
|{
    readonly type: "bonus-multiplier";
    readonly multiplier: number;
}
| {
    readonly type: "sticky-wild";
    readonly reelIndex: 0 | 1 | 2 | 3 | 4;
};

export type ChestRewards = readonly [
    ChestReward,
    ChestReward,
    ChestReward,
    ChestReward,
    ChestReward,
];