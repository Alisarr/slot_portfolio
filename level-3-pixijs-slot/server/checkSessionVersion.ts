import {
  deepStrictEqual,
  rejects,
  strictEqual,
} from "node:assert";
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

async function expectVersion(
  id: string,
  expected: number,
): Promise<void> {
  const stored = await loadStoredSession(id);
  strictEqual(stored?.version, expected);
}

try {
  const id = await createStoredSession(createGameSession(100));
  const requestId = randomUUID();
  const createBoard = () => losingBoard;

  await expectVersion(id, 0);

// Первое вращение.
const first = await spinStoredSession(
  id, requestId, 2, createBoard,
);

strictEqual(first.version, 1);
await expectVersion(id, 1);

// Повтор первого запроса: используем тот же requestId.
const replay = await spinStoredSession(
  id, requestId, 2, createBoard,
);

deepStrictEqual(replay, first);
await expectVersion(id, 1);

// Второе вращение: создаём новый requestId.
const second = await spinStoredSession(
  id, randomUUID(), 2, createBoard,
);

strictEqual(second.version, 2);
await expectVersion(id, 2);

// Снова запрашиваем результат первого вращения.
const oldReplay = await spinStoredSession(
  id, requestId, 2, createBoard,
);

strictEqual(oldReplay.version, 1);
deepStrictEqual(oldReplay, first);
await expectVersion(id, 2);
  strictEqual((await loadStoredSession(id))?.state.balance, 96);

  await rejects(
  () => spinStoredSession(
    id, randomUUID(), 1000, createBoard,
  ),
  { code: "INSUFFICIENT_BALANCE" },
);

await expectVersion(id, 2);

strictEqual(
  (await loadStoredSession(id))?.state.balance,
  96,
);

  console.log(
    "Versions: 0 -> 1 -> 2; replays and rejection keep version 2",
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}