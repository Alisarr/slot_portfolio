import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGameSession } from "../src/game/GameSession.ts";
import { chooseSessionChest } from "../src/game/chooseSessionChest.ts";
import { startBonus } from "../src/bonus/startBonus.ts";
import type {
  createStoredSession,
  loadStoredSession,
} from "./sessionRepository.ts";
import type { spinStoredSession } from "./spinStoredSession.ts";
import type { chooseStoredChest } from "./chooseStoredChest.ts";
import { buildApp } from "./app.ts";
import { GameError } from "../src/shared/GameError.ts";

const sessionId = "33df6a40-35f1-4fc7-a7f6-9a4f922d0084";
const requestId = "de4bff1e-aa0f-4bac-92bb-8d7dae52eb26";
const payload = { requestId, chestIndex: 0 };

const rewards = [
  { type: "free-spins", spins: 5 },
  { type: "bonus-multiplier", multiplier: 3 },
  { type: "sticky-wild", reelIndex: 2 },
  { type: "wild-boost", amount: 1 },
  { type: "symbol-upgrade" },
] as const;

const loadSession = vi.fn<typeof loadStoredSession>();
const createSession = vi.fn<typeof createStoredSession>();
const spinSession = vi.fn<typeof spinStoredSession>();
const chooseChest = vi.fn<typeof chooseStoredChest>();

let app: ReturnType<typeof buildApp>;

beforeEach(() => {
  loadSession.mockReset();
  createSession.mockReset();
  spinSession.mockReset();
  chooseChest.mockReset();

  app = buildApp({
    loadSession,
    createSession,
    spinSession,
    chooseChest,
  });
});

afterEach(async () => {
  await app.close();
});

describe("POST /sessions/:id/chest", () => {
  it.each([
    [0, { remainingSpins: 20 }],
    [1, { winMultiplier: 3 }],
    [2, { stickyReels: [{ reelIndex: 2, multiplier: 1 }] }],
    [3, { wildMultiplierBoost: 1 }],
    [4, { symbolUpgradeActive: true }],
  ] as const)(
    "returns the effect of chest %i without exposing rewards",
    async (index, effect) => {
      const pending = {
        ...createGameSession(100),
        bonusBet: 2,
        bonus: startBonus(4, () => rewards),
      };

      const selected = chooseSessionChest(pending, index);
      chooseChest.mockResolvedValue({
        session: selected,
        version: 4,
      });

      const request = {
        method: "POST" as const,
        url: `/sessions/${sessionId}/chest`,
        payload: { requestId, chestIndex: index },
      };

      const first = await app.inject(request);
      const replay = await app.inject(request);

      expect(first.statusCode).toBe(200);
      expect(replay.statusCode).toBe(200);
      expect(first.headers["cache-control"]).toBe("no-store");
      expect(first.json().version).toBe(4);

      expect(chooseChest).toHaveBeenNthCalledWith(
        1, sessionId, requestId, index,
      );
      expect(chooseChest).toHaveBeenNthCalledWith(
        2, sessionId, requestId, index,
      );

      expect(first.json()).toMatchObject({
        requestId,
        session: {
          balance: 100,
          bonusBet: 2,
          bonus: {
            ...effect,
            chestStatus: "claimed",
            selectedChestIndex: index,
          },
        },
      });

      expect(first.json().session.bonus)
        .not.toHaveProperty("chestRewards");

      expect(replay.json()).toEqual(first.json());
    },
  );

  it.each([
    {},
    { requestId: "bad-id", chestIndex: 0 },
    { requestId, chestIndex: -1 },
    { requestId, chestIndex: 5 },
    { requestId, chestIndex: 0.5 },
    { requestId, chestIndex: "0" },
    { ...payload, reward: { type: "free-spins", spins: 999 } },
  ])("rejects invalid input %j before choosing a chest", async (invalidBody) => {
    const response = await app.inject({
      method: "POST",
      url: `/sessions/${sessionId}/chest`,
      payload: invalidBody,
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: "Invalid chest request",
    });
    expect(chooseChest).not.toHaveBeenCalled();
  });

  it("rejects an invalid session ID", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/sessions/bad-id/chest",
      payload,
    });

    expect(response.statusCode).toBe(400);
    expect(chooseChest).not.toHaveBeenCalled();
  });

 it.each([
  ["SESSION_NOT_FOUND", "Game session not found", 404],
  ["BONUS_NOT_ACTIVE", "No active bonus", 409],
  ["CHEST_NOT_PENDING", "No chest reward is pending", 409],
  [
    "REQUEST_ID_CONFLICT",
    "Request ID was already used with a different chest",
    409,
  ],
] as const)(
  "returns the expected status for %s",
  async (code, message, status) => {
    chooseChest.mockRejectedValue(
      new GameError(code, message),
    );

    const response = await app.inject({
      method: "POST",
      url: `/sessions/${sessionId}/chest`,
      payload,
    });

    expect(response.statusCode).toBe(status);
    expect(response.json()).toEqual({
      code,
      error: message,
    });
  },
);


it("keeps the same status when the message changes", async () => {
  const message = "Chose chest alredy finish";

  chooseChest.mockRejectedValue(
    new GameError("CHEST_NOT_PENDING", message),
  );

  const response = await app.inject({
    method: "POST",
    url: `/sessions/${sessionId}/chest`,
    payload,
  });

  expect(response.statusCode).toBe(409);
  expect(response.json()).toEqual({
    code: "CHEST_NOT_PENDING",
    error: message,
  });
});

it("does not classify a plain error by its message", async () => {
  chooseChest.mockRejectedValue(
    new Error("No chest reward is pending"),
  );

  const response = await app.inject({
    method: "POST",
    url: `/sessions/${sessionId}/chest`,
    payload,
  });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({
    error: "Internal server error",
  });
});

it("hides unexpected internal errors", async () => {
  chooseChest.mockRejectedValue(
    new Error("Private database details"),
  );

  const response = await app.inject({
    method: "POST",
    url: `/sessions/${sessionId}/chest`,
    payload,
  });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({
    error: "Internal server error",
  });
});
});
