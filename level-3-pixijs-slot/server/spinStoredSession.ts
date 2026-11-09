import type { Board } from "../src/core/types.ts";
import type { GameSpinResults } from "../src/game/GameSession.ts";
import { generateBoard } from "../src/core/generateBoard.ts";
import { BASE_PAYLINES } from "../src/core/paylines.ts";
import {
  isBonusActive,
  isChestChoicePending,
} from "../src/bonus/BonusState.ts";
import { generateWildMultiplier } from "../src/bonus/generateWildMultiplier.ts";
import { validatePaidSpin } from "../src/game/validatePaidSpin.ts";
import { playNextSpin } from "../src/game/platNestSpin.ts";
import { parseGameSession } from "./parseGameSession.ts";
import { pool } from "./db.ts";

export interface StoredSpinResult extends GameSpinResults {
  readonly mode: "paid" | "free";
}

export async function spinStoredSession(
  id: string,
  totalBet: number,
  createBoard: () => Board = generateBoard,
  createMultiplier: () => number = generateWildMultiplier,
): Promise<StoredSpinResult> {
  const client = await pool.connect();
  let discardClient = false;

  try {
    await client.query("BEGIN");

    // Загружаем сессию и блокируем её для этого спина.
    const stored = await client.query<{ state: unknown }>(
      "SELECT state FROM game_sessions WHERE id = $1 FOR UPDATE",
      [id],
    );

    const row = stored.rows[0];

    if (row === undefined) {
      throw new Error("Game session not found");
    }

    const session = parseGameSession(row.state);
    const isFreeSpin = isBonusActive(session.bonus);

    // Проверяем ограничения до генерации доски.
    if (isFreeSpin && isChestChoicePending(session.bonus)) {
      throw new Error("Choose a chest before starting free spins");
    }

    if (!isFreeSpin) {
      validatePaidSpin(session.balance, totalBet, BASE_PAYLINES);
    }

    const board = createBoard();

    const result = playNextSpin(
      session,
      totalBet,
      board,
      createMultiplier,
    );

    // Проверяем новое состояние перед записью.
    const nextSession = parseGameSession(result.session);

    const updated = await client.query(
      "UPDATE game_sessions SET state = $2::jsonb WHERE id = $1",
      [id, JSON.stringify(nextSession)],
    );

    if (updated.rowCount !== 1) {
      throw new Error("Game session not found");
    }

    await client.query("COMMIT");

    return {
      ...result,
      session: nextSession,
      mode: isFreeSpin ? "free" : "paid",
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      discardClient = true;
    }

    throw error;
  } finally {
    client.release(discardClient);
  }
}