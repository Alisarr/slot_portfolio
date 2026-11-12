import { createGameSession } from "../src/game/GameSession";
import { startBonus } from "../src/bonus/startBonus";
import { createStoredSession } from "./sessionRepository";
import { pool } from "./db";
import type { ChestRewards } from "../src/bonus/ChestTypes";

const rewards = [
    {type: "free-spins", spins: 5},
    {type: "bonus-multiplier", multiplier: 3},
    {type: "sticky-wild", reelIndex: 2},
    {type: "wild-boost", amount: 1},
    {type: "symbol-upgrade"},
] as const satisfies ChestRewards;

try {
    const session = {
        ...createGameSession(100),
        bonusBet: 2,
        bonus: startBonus(4, () => rewards),
    };

    const id = await createStoredSession(session);

    console.log("Chest demo session:", id);
    console.log(
        "15 free spins; chest choice pending; 0 awards +5 spins",
    );
} catch (error) {
    console.error(error);
    process.exitCode = 1;
} finally {
    await pool.end();
}