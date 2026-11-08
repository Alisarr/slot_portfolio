import { deepStrictEqual } from "node:assert";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { createGameSession } from "../src/game/GameSession.ts";
import type { GameSession } from "../src/game/GameSession.ts";

const pool = new Pool({ connectionTimeoutMillis: 5000 });

try {
  const initial = createGameSession(100);

  const session: GameSession = {
    ...initial,
    bonusBet: 2,
    bonus: {
      ...initial.bonus,
      remainingSpins: 7,
      stickyReels: [{ reelIndex: 1, multiplier: 3 }],
    },
  };

  const id = randomUUID();

  await pool.query(
    "INSERT INTO game_sessions (id, state) VALUES ($1, $2::jsonb)",
    [id, JSON.stringify(session)],
  );

  const result = await pool.query<{ state: unknown }>(
    "SELECT state FROM game_sessions WHERE id = $1",
    [id],
  );

  const restored = result.rows[0]?.state;
  deepStrictEqual(restored, session);

  console.log("Session saved and loaded successfully:", id);
  console.dir(restored, { depth: null });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await pool.end();
}