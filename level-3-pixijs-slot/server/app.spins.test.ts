import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Board } from "../src/core/types.ts";
import { createGameSession } from "../src/game/GameSession.ts";
import { startBonus } from "../src/bonus/startBonus.ts";
import { generateChestRewards } from "../src/bonus/generateChestRewards.ts";
import type {
  createStoredSession,
  loadStoredSession,
} from "./sessionRepository.ts";
import type {
  spinStoredSession,
  StoredSpinResult,
} from "./spinStoredSession.ts";
import { buildApp } from "./app.ts";

const sessionId = "33df6a40-35f1-4fc7-a7f6-9a4f922d0084";
const requestId = "de4bff1e-aa0f-4bac-92bb-8d7dae52eb26";

const payload = { requestId, totalBet: 2 };

const board = [
  ["low-1", "scatter", "low-2"],
  ["low-2", "scatter", "low-3"],
  ["low-3", "scatter", "low-4"],
  ["low-4", "scatter", "low-1"],
  ["high-1", "low-1", "low-2"],
] as const satisfies Board;

const loadSession = vi.fn<typeof loadStoredSession>();
const createSession = vi.fn<typeof createStoredSession>();
const spinSession = vi.fn<typeof spinStoredSession>();

let app: ReturnType<typeof buildApp>;

beforeEach(() => {
  loadSession.mockReset();
  createSession.mockReset();
  spinSession.mockReset();

  app = buildApp({ loadSession, createSession, spinSession });
});

afterEach(async () => {
  await app.close();
});

describe("POST /sessions/:id/spins", () => {
  it("forwards the request and hides rewards in both responses", async () => {
    const result: StoredSpinResult = {
      mode: "paid",
      board,
      boardBeforeExpansion: board,
      spin: {
        lineWins: [],
        totalWin: 0,
        scatterCount: 4,
      },
      session: {
        ...createGameSession(98),
        bonusBet: 2,
        bonus: startBonus(4, () => generateChestRewards(() => 0)),
      },
    };

    spinSession.mockResolvedValue(result);

    const first = await app.inject({
      method: "POST",
      url: `/sessions/${sessionId}/spins`,
      payload,
    });

    const replay = await app.inject({
      method: "POST",
      url: `/sessions/${sessionId}/spins`,
      payload,
    });

    expect(first.statusCode).toBe(200);
    expect(replay.statusCode).toBe(200);
    expect(first.headers["cache-control"]).toBe("no-store");

    expect(spinSession).toHaveBeenNthCalledWith(
      1, sessionId, requestId, 2,
    );
    expect(spinSession).toHaveBeenNthCalledWith(
      2, sessionId, requestId, 2,
    );

    expect(first.json()).toMatchObject({
      requestId,
      mode: "paid",
      board,
      boardBeforeExpansion: board,
      spin: { totalWin: 0, scatterCount: 4 },
      session: {
        balance: 98,
        bonus: { chestStatus: "pending" },
      },
    });

    expect(first.json().session.bonus)
      .not.toHaveProperty("chestRewards");

    expect(replay.json()).toEqual(first.json());
    expect(result.session.bonus.chestRewards).not.toBeNull();
  });

  it.each([
    {},
    { requestId: "bad-id", totalBet: 2 },
    { requestId, totalBet: 0 },
    { requestId, totalBet: -2 },
    { requestId, totalBet: "2" },
    { ...payload, board },
  ])("rejects invalid input %j before running a spin", async (invalidBody) => {
    const response = await app.inject({
      method: "POST",
      url: `/sessions/${sessionId}/spins`,
      payload: invalidBody,
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: "Invalid spin request",
    });
    expect(spinSession).not.toHaveBeenCalled();
  });

  it("rejects an invalid session ID before running a spin", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/sessions/bad-id/spins",
      payload,
    });

    expect(response.statusCode).toBe(400);
    expect(spinSession).not.toHaveBeenCalled();
  });

  it.each([
    ["Game session not found", 404],
    ["Insufficient balance", 409],
    ["Choose a chest before starting free spins", 409],
    ["Request ID was already used with a different bet", 409],
  ] as const)("returns the expected status for %s", async (message, status) => {
    spinSession.mockRejectedValue(new Error(message));

    const response = await app.inject({
      method: "POST",
      url: `/sessions/${sessionId}/spins`,
      payload,
    });

    expect(response.statusCode).toBe(status);
    expect(response.json()).toEqual({ error: message });
  });

  it("hides unexpected internal errors", async () => {
    spinSession.mockRejectedValue(
      new Error("Private database details"),
    );

    const response = await app.inject({
      method: "POST",
      url: `/sessions/${sessionId}/spins`,
      payload,
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: "Internal server error",
    });
  });
});