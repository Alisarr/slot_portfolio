import { randomUUID } from "node:crypto";
import type { GameSession } from "../src/game/GameSession.ts";
import { pool } from "./db.ts";
import { parseGameSession } from "./parseGameSession.ts"

interface StoredGameSession {
  readonly id: string;
  readonly state: GameSession;
}

export async function createStoredSession(
  session: GameSession,
): Promise<string> {
  const id = randomUUID();

  await pool.query(
    "INSERT INTO game_sessions (id, state) VALUES ($1, $2::jsonb)",
    [id, JSON.stringify(session)],
  );

  return id;
}

export async function loadStoredSession(
  id: string,
): Promise<StoredGameSession | null> {
  const result = await pool.query<{
    id: string;
    state: unknown;
  }>(
    "SELECT id, state FROM game_sessions WHERE id = $1",
    [id],
  );

  const row = result.rows[0];

  if (row === undefined) {
    return null;
  }

  return {
    id: row.id,
    state: parseGameSession(row.state),
  };
}

export async function updateStoredSession(
  id: string,
  session: GameSession,
): Promise<void> {
  const result = await pool.query(
    "UPDATE game_sessions SET state = $2::jsonb WHERE id = $1",
    [id, JSON.stringify(session)],
  );

  if (result.rowCount !== 1) {
    throw new Error("Game session not found");
  }
}