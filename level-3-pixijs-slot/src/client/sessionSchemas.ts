import { z } from "zod";

const money = z.number().finite().nonnegative();
const count = z.number().int().nonnegative();
const reelIndex = z.number().int().min(0).max(4);

export const publicGameSessionSchema = z.strictObject({
    balance: money,
    bonusBet: z.number().finite().positive().nullable(),

    bonus: z.strictObject({
        kind: z.enum(["standard", "chest"]),
        chestStatus: z.enum(["not-required", "pending", "claimed"]),
        selectedChestIndex: reelIndex.nullable(),
        remainingSpins: count,
        totalWin: money,
        winMultiplier: z.literal([1, 3]),
        wildMultiplierBoost: z.literal([0, 1]),
        symbolUpgradeActive: z.boolean(),
        stormCharge: count,
        overloadActive: z.boolean(),
        stickyReels: z.array(z.strictObject
            ({
                reelIndex,
                multiplier: z.number().int().positive(),
            })).max(5),
    }),
});

export const getSessionResponseSchema = z.strictObject({
    id: z.uuid(),
    version: count,
    session: publicGameSessionSchema,
});

export type PublicGameSession = z.infer<typeof publicGameSessionSchema>;