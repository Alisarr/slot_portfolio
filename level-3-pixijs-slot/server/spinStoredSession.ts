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
import { parseStoredSpinResult } from "./parseStoredSpinResult.ts";
import { pool } from "./db.ts";
import { GameError } from "../src/shared/GameError.ts";

export interface StoredSpinResult extends GameSpinResults {
  readonly mode: "paid" | "free";
}

export async function spinStoredSession(
  id: string,
  requestId: string,
  totalBet: number,
  createBoard: () => Board = generateBoard,
  createMultiplier: () => number = generateWildMultiplier,
): Promise<StoredSpinResult> {
  if (!Number.isFinite(totalBet) || totalBet <= 0) {
    throw new Error("Bet must be positive and finite");
  }

  const client = await pool.connect();
  let discardClient = false;

  try {
    await client.query("BEGIN");

    const stored = await client.query<{ state: unknown }>(
      "SELECT state FROM game_sessions WHERE id = $1 FOR UPDATE",
      [id],
    );

    const row = stored.rows[0];

    if (row === undefined) {
      throw new GameError(
     "SESSION_NOT_FOUND",
     "Game session not found",
      );
    }

    // Сначала проверяем, выполнялся ли этот запрос.
    const previous = await client.query<{
      total_bet: number;
      response: unknown;
    }>(
      `SELECT total_bet, response FROM spin_requests
       WHERE session_id = $1 AND request_id = $2`,
      [id, requestId],
    );

    const saved = previous.rows[0];

    if (saved !== undefined) {
      if (saved.total_bet !== totalBet) {
       throw new GameError(
        "REQUEST_ID_CONFLICT",
        "Request ID was already used with a different bet",
        );
       }

      const response = parseStoredSpinResult(saved.response);

      await client.query("COMMIT");

      return response;
    }

    // Запрос новый — выполняем обычную игровую логику.
    const session = parseGameSession(row.state);
    const isFreeSpin = isBonusActive(session.bonus);

   if (isFreeSpin && isChestChoicePending(session.bonus)) {
   throw new GameError(
    "CHEST_CHOICE_REQUIRED",
    "Choose a chest before starting free spins",
    );
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

    const response = parseStoredSpinResult({
      ...result,
      mode: isFreeSpin ? "free" : "paid",
    });

    const updated = await client.query(
      "UPDATE game_sessions SET state = $2::jsonb WHERE id = $1",
      [id, JSON.stringify(response.session)],
    );

    if (updated.rowCount !== 1) {
      throw new GameError(
      "SESSION_NOT_FOUND",
      "Game session not found",
      );
    }

    // Запоминаем ответ в той же транзакции.
    await client.query(
      `INSERT INTO spin_requests
         (session_id, request_id, total_bet, response)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [id, requestId, totalBet, JSON.stringify(response)],
    );

    await client.query("COMMIT");

    return response;
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