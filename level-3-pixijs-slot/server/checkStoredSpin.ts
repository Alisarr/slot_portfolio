import {
  deepStrictEqual,
  rejects,
  strictEqual,
} from "node:assert";
import type { Board } from "../src/core/types.ts";
import type { GameSession } from "../src/game/GameSession.ts";
import { createGameSession } from "../src/game/GameSession.ts";
import { pool } from "./db.ts";
import {
  createStoredSession,
  loadStoredSession,
} from "./sessionRepository.ts";
import { spinStoredSession } from "./spinStoredSession.ts";

const losingBoard = [
  ["low-1", "low-1", "low-1"],
  ["low-2", "low-2", "low-2"],
  ["low-3", "low-3", "low-3"],
  ["low-4", "low-4", "low-4"],
  ["high-1", "high-1", "high-1"],
] as const satisfies Board;

try {
  const initial = createGameSession(98);

  const active: GameSession = {
    ...initial,
    bonusBet: 2,
    bonus: {
      ...initial.bonus,
      remainingSpins: 7,
      stickyReels: [{ reelIndex: 1, multiplier: 3 }],
    },
  };

  // Сохраняем сессию, выполняем спин и загружаем её заново.
  const id = await createStoredSession(active);
  const result = await spinStoredSession(id, 2, () => losingBoard);
  const restored = await loadStoredSession(id);

  strictEqual(result.mode, "free");
  strictEqual(result.spin.totalWin, 0);

  deepStrictEqual(result.session, {
    ...active,
    bonus: {
      ...active.bonus,
      remainingSpins: 6,
    },
  });

  deepStrictEqual(restored?.state, result.session);

  // Проверяем отказ: баланс 1, ставка 2.
  const poorSession = createGameSession(1);
  const poorId = await createStoredSession(poorSession);
  let boardCalls = 0;

  await rejects(
    () => spinStoredSession(poorId, 2, () => {
      boardCalls += 1;
      return losingBoard;
    }),
    { message: "Insufficient balance" },
  );

  strictEqual(boardCalls, 0);

  deepStrictEqual(
    (await loadStoredSession(poorId))?.state,
    poorSession,
  );

  console.log("Free spin saved: 7 -> 6; balance: 98; bonus bet: 2");
  console.log("Invalid paid spin: rejected; session unchanged");
  console.log("Free-spin session ID:", id);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await pool.end();
}