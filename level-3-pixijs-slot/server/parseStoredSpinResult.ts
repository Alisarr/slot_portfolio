import { z } from "zod";
import { SYMBOL_IDS } from "../src/core/types";
import { parseGameSession } from "./parseGameSession";


const symbol = z.enum(SYMBOL_IDS);
const reel = z.tuple([symbol, symbol, symbol]);
const board = z.tuple([reel, reel, reel, reel, reel]);
const money = z.number().finite().nonnegative();

const storedSpinSchema = z.strictObject({
    session: z.unknown(),
    mode: z.enum(["paid", "free"]),
    board,
    version: z.number().int().nonnegative().nullable().default(null),
    boardBeforeExpansion: board,
    spin: z.strictObject({
        lineWins: z.array(z.strictObject({
            paylineIndex: z.number().int().min(0).max(4),
            symbol,
            count: z.literal([3, 4, 5]),
            amount: money,
        })),
        totalWin: money,
        scatterCount: z.number().int().min(0).max(15),
    }),
});

export function parseStoredSpinResult(value: unknown) {
    const result = storedSpinSchema.parse(value);

    return {
        ...result,
        session: parseGameSession(result.session),
    };
}