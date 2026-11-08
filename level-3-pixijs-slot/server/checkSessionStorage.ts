import { deepStrictEqual } from "node:assert";
import { createGameSession } from "../src/game/GameSession.ts";
import type { GameSession } from "../src/game/GameSession.ts";
import { pool } from "./db.ts";
import {
  createStoredSession,
  loadStoredSession,
  updateStoredSession,
} from "./sessionRepository.ts";

try {
  const requestedId = process.argv[2];

  if (requestedId !== undefined) {
    const stored = await loadStoredSession(requestedId);

    if (stored === null) {
      throw new Error("Game session not found");
    }

    console.log("Loaded session:", stored.id);
    console.dir(stored.state, { depth: null });
  } else {
    const initial = createGameSession(100);

    const id = await createStoredSession(initial);
    const created = await loadStoredSession(id);

    deepStrictEqual(created?.state, initial);

    const updated: GameSession = {
      ...initial,
      balance: 98,
      bonusBet: 2,
      bonus: {
        ...initial.bonus,
        remainingSpins: 7,
        stickyReels: [{ reelIndex: 1, multiplier: 3 }],
      },
    };

    await updateStoredSession(id, updated);

    const restored = await loadStoredSession(id);
    deepStrictEqual(restored?.state, updated);

    console.log("Create, update and load: OK");
    console.log("Session ID:", id);
  }
} catch (error) {
  console.error(
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}