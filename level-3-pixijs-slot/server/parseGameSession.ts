import { z } from "zod";   
import type { GameSession } from "../src/game/GameSession";

const money = z.number().finite().nonnegative();
const spinCount = z.number().int().nonnegative();
const index = z.literal([0, 1, 2, 3, 4]);

const chestReward = z.discriminatedUnion("type", [
    z.strictObject({
        type: z.literal("free-spins"),
        spins: z.number().int().positive(),
    }),
    z.strictObject({
        type: z.literal("bonus-multiplier"),
        multiplier: z.literal(3),
    }),
    z.strictObject({
        type: z.literal("sticky-wild"),
        reelIndex: index,
    }),
    z.strictObject({
        type: z.literal("wild-boost"),
        amount: z.literal(1),
    }),
    z.strictObject({
        type: z.literal
        ("symbol-upgrade"),
    }),
]);

const chestRewards = z.tuple([
    chestReward,
    chestReward,
    chestReward,
    chestReward,
    chestReward,
]);

const stickyReels = z
.array(
    z.strictObject({
        reelIndex: index,
        multiplier: z.number().int().positive(),
    }),
)
.max(5)
.refine(
    (reels) => 
        new Set(reels.map((reel) => reel.reelIndex)).size === reels.length,
    { message: "Sticky reel indexes must be unique"},
);

const commonBonusFields = {
    remainingSpins: spinCount,
    totalWin: money,
    winMultiplier: z.literal([1, 3]),
    wildMultiplierBoost: z.literal([0, 1]),
    symbolUpgradeActive: z.boolean(),
    stormCharge: spinCount,
    overloadActive: z.boolean(),
    stickyReels,
};
const bonus = z.discriminatedUnion("chestStatus", [
  z.strictObject({
    ...commonBonusFields,
    kind: z.literal("standard"),
    chestStatus: z.literal("not-required"),
    chestRewards: z.null(),
    selectedChestIndex: z.null(),
  }),
  z.strictObject({
    ...commonBonusFields,
    kind: z.literal("chest"),
    chestStatus: z.literal("pending"),
    remainingSpins: z.number().int().positive(),
    chestRewards,
    selectedChestIndex: z.null(),
  }),
  z.strictObject({
    ...commonBonusFields,
    kind: z.literal("chest"),
    chestStatus: z.literal("claimed"),
    chestRewards: chestRewards.nullable(),
    selectedChestIndex: index,
  }),
]);

const gameSessionSchema = z
  .strictObject({
    balance: money,
    bonusBet: z.number().finite().positive().nullable(),
    bonus,
  })
  .refine(
    (session) =>
      session.bonus.remainingSpins > 0
        ? session.bonusBet !== null
        : session.bonusBet === null,
    {
      message: "Bonus bet must match bonus activity",
      path: ["bonusBet"],
    },
  );

export function parseGameSession(value: unknown): GameSession {
  return gameSessionSchema.parse(value);
}
