import { deepStrictEqual, rejects, strictEqual } from "node:assert";
import { randomUUID } from "node:crypto";
import type { Board } from "../src/core/types.ts";
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
  const id = await createStoredSession(createGameSession(100));
  const requestId = randomUUID();
  let boardCalls = 0;

  const createBoard = (): Board => {
    boardCalls += 1;
    return losingBoard;
  };

  // Две отправки одного спина: идентификатор одинаковый.
  const [first, repeated] = await Promise.all([
    spinStoredSession(id, requestId, 2, createBoard),
    spinStoredSession(id, requestId, 2, createBoard),
  ]);

  deepStrictEqual(repeated, first);
  strictEqual(first.session.balance, 98);
  strictEqual(boardCalls, 1);
  deepStrictEqual((await loadStoredSession(id))?.state, first.session);

  // Тот же идентификатор с другой ставкой — ошибка.
  await rejects(
    () => spinStoredSession(id, requestId, 3, createBoard),
    { message: "Request ID was already used with a different bet" },
  );

  strictEqual(boardCalls, 1);
  deepStrictEqual((await loadStoredSession(id))?.state, first.session);

  // Новый идентификатор — новый спин.
  const second = await spinStoredSession(
    id,
    randomUUID(),
    2,
    createBoard,
  );

  strictEqual(second.session.balance, 96);
  strictEqual(boardCalls, 2);

  // Повтор старого запроса не откатывает состояние базы.
  const oldResponse = await spinStoredSession(
    id,
    requestId,
    2,
    createBoard,
  );

  deepStrictEqual(oldResponse, first);
  deepStrictEqual((await loadStoredSession(id))?.state, second.session);
  strictEqual(boardCalls, 2);

  const count = await pool.query<{ count: number }>(
    "SELECT count(*)::int AS count FROM spin_requests WHERE session_id = $1",
    [id],
  );

  strictEqual(count.rows[0]?.count, 2);

  // Проверяем повтор последнего фриспина.
  const initial = createGameSession(98);

  const freeId = await createStoredSession({
    ...initial,
    bonusBet: 2,
    bonus: {
      ...initial.bonus,
      remainingSpins: 1,
    },
  });

  const freeRequestId = randomUUID();

  const lastFree = await spinStoredSession(
    freeId,
    freeRequestId,
    2,
    createBoard,
  );

  const replayedFree = await spinStoredSession(
    freeId,
    freeRequestId,
    2,
    createBoard,
  );

  deepStrictEqual(replayedFree, lastFree);
  strictEqual(lastFree.mode, "free");
  strictEqual(lastFree.session.bonus.remainingSpins, 0);
  strictEqual(lastFree.session.bonusBet, null);
  strictEqual(lastFree.session.balance, 98);
  strictEqual(boardCalls, 3);
  deepStrictEqual((await loadStoredSession(freeId))?.state, lastFree.session);

  console.log("Duplicate request: one spin, one bet, one board");
  console.log("Changed bet: rejected");
  console.log("New request: balance 98 -> 96; old replay leaves it at 96");
  console.log("Last free-spin replay: still free; balance 98");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await pool.end();
}