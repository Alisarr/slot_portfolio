import { deepStrictEqual, rejects, strictEqual } from "node:assert";
import { randomUUID } from "node:crypto";
import type { Board } from "../src/core/types.ts";
import { createGameSession } from "../src/game/GameSession.ts";
import { startBonus } from "../src/bonus/startBonus.ts";
import { pool } from "./db.ts";
import {
  createStoredSession,
  loadStoredSession,
} from "./sessionRepository.ts";
import { chooseStoredChest } from "./chooseStoredChest.ts";
import { spinStoredSession } from "./spinStoredSession.ts";

const rewards = [
  { type: "free-spins", spins: 5 },
  { type: "bonus-multiplier", multiplier: 3 },
  { type: "sticky-wild", reelIndex: 2 },
  { type: "wild-boost", amount: 1 },
  { type: "symbol-upgrade" },
] as const;

const losingBoard = [
  ["low-1", "low-1", "low-1"],
  ["low-2", "low-2", "low-2"],
  ["low-3", "low-3", "low-3"],
  ["low-4", "low-4", "low-4"],
  ["high-1", "high-1", "high-1"],
] as const satisfies Board;

function createPendingSession() {
  return {
    ...createGameSession(100),
    bonusBet: 2,
    bonus: startBonus(4, () => rewards),
  };
}

try {
  // Проверяем каждый вид награды в отдельном бонусе.
  for (let chestIndex = 0; chestIndex < rewards.length; chestIndex += 1) {
    const pending = createPendingSession();
    const id = await createStoredSession(pending);
    const requestId = randomUUID();

    const [chosen, repeated] = await Promise.all([
      chooseStoredChest(id, requestId, chestIndex),
      chooseStoredChest(id, requestId, chestIndex),
    ]);

    deepStrictEqual(repeated, chosen);
    strictEqual(chosen.balance, 100);
    strictEqual(chosen.bonusBet, 2);
    strictEqual(chosen.bonus.chestStatus, "claimed");
    strictEqual(chosen.bonus.selectedChestIndex, chestIndex);

    // Проверяем эффект выбранной награды.
    strictEqual(
      chosen.bonus.remainingSpins,
      pending.bonus.remainingSpins + (chestIndex === 0 ? 5 : 0),
    );

    strictEqual(
      chosen.bonus.winMultiplier,
      chestIndex === 1 ? 3 : 1,
    );

    deepStrictEqual(
      chosen.bonus.stickyReels,
      chestIndex === 2 ? [{ reelIndex: 2, multiplier: 1 }] : [],
    );

    strictEqual(
      chosen.bonus.wildMultiplierBoost,
      chestIndex === 3 ? 1 : 0,
    );

    strictEqual(
      chosen.bonus.symbolUpgradeActive,
      chestIndex === 4,
    );

    deepStrictEqual((await loadStoredSession(id))?.state, chosen);

    const otherChest = chestIndex === 0 ? 1 : 0;

    // Прежний requestId нельзя использовать для другого сундука.
    await rejects(
      () => chooseStoredChest(id, requestId, otherChest),
      { message: "Request ID was already used with a different chest" },
    );

    // Новый requestId тоже не позволяет получить вторую награду.
    await rejects(
      () => chooseStoredChest(id, randomUUID(), otherChest),
      { message: "No chest reward is pending" },
    );

    deepStrictEqual((await loadStoredSession(id))?.state, chosen);

    // После выбора бонус позволяет выполнить фриспин.
    const spin = await spinStoredSession(
      id,
      randomUUID(),
      2,
      () => losingBoard,
    );

    strictEqual(spin.mode, "free");
    strictEqual(spin.spin.totalWin, 0);

    strictEqual(
      spin.session.bonus.remainingSpins,
      chosen.bonus.remainingSpins - 1,
    );

    // Повтор старого выбора не возвращает потраченное вращение.
    const oldResponse = await chooseStoredChest(
      id,
      requestId,
      chestIndex,
    );

    deepStrictEqual(oldResponse, chosen);
    deepStrictEqual((await loadStoredSession(id))?.state, spin.session);

    console.log("Reward saved once:", rewards[chestIndex].type);
  }

  // Две попытки выбрать разные сундуки одновременно.
  const raceId = await createStoredSession(createPendingSession());

  const outcomes = await Promise.allSettled([
    chooseStoredChest(raceId, randomUUID(), 0),
    chooseStoredChest(raceId, randomUUID(), 1),
  ]);

  const successes = outcomes.filter(
    (outcome) => outcome.status === "fulfilled",
  );

  const failures = outcomes.filter(
    (outcome) => outcome.status === "rejected",
  );

  strictEqual(successes.length, 1);
  strictEqual(failures.length, 1);
  strictEqual(failures[0]?.reason.message, "No chest reward is pending");

  deepStrictEqual(
    (await loadStoredSession(raceId))?.state,
    successes[0]?.value,
  );

  const count = await pool.query<{ count: number }>(
    "SELECT count(*)::int AS count FROM chest_requests WHERE session_id = $1",
    [raceId],
  );

  strictEqual(count.rows[0]?.count, 1);

  console.log("Concurrent different choices: one accepted, one rejected");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}