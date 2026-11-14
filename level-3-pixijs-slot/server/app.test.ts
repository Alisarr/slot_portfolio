import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGameSession } from "../src/game/GameSession.ts";
import { startBonus } from "../src/bonus/startBonus.ts";
import { generateChestRewards } from "../src/bonus/generateChestRewards.ts";
import type {
  createStoredSession,
  loadStoredSession,
} from "./sessionRepository.ts";
import { buildApp } from "./app.ts";
import { spinStoredSession } from "./spinStoredSession.ts";
import  type { chooseStoredChest } from "./chooseStoredChest.ts";

const sessionId = "33df6a40-35f1-4fc7-a7f6-9a4f922d0084";

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

  app = buildApp({ loadSession, createSession, spinSession, chooseChest, });
});

afterEach(async () => {
  await app.close();
});

describe("GET /sessions/:id", () => {
  it("returns the session without exposing chest rewards", async () => {
    const session = {
      ...createGameSession(98),
      bonusBet: 2,
      bonus: startBonus(4, () => generateChestRewards(() => 0)),
    };

    loadSession.mockResolvedValue({
      id: sessionId,
      state: session,
      version: 7,
    });

    const response = await app.inject({
      method: "GET",
      url: `/sessions/${sessionId}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.json().version).toBe(7);

    expect(response.json()).toMatchObject({
      id: sessionId,
      session: {
        balance: 98,
        bonusBet: 2,
        bonus: {
          chestStatus: "pending",
          remainingSpins: 15,
        },
      },
    });

    expect(response.json().session.bonus)
      .not.toHaveProperty("chestRewards");

    expect(loadSession).toHaveBeenCalledExactlyOnceWith(sessionId);
    expect(session.bonus.chestRewards).not.toBeNull();
  });

  it("rejects an invalid ID before loading a session", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/sessions/not-a-uuid",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: "Invalid session ID",
    });
    expect(loadSession).not.toHaveBeenCalled();
  });

  it("returns 404 when the session does not exist", async () => {
    loadSession.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: `/sessions/${sessionId}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: "Game session not found",
    });
  });

  it("returns a generic error when loading fails", async () => {
    loadSession.mockRejectedValue(
      new Error("Private database details"),
    );

    const response = await app.inject({
      method: "GET",
      url: `/sessions/${sessionId}`,
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: "Internal server error",
    });
  });
  describe("POST /sessions", () => {
  it("saves a new demo session and returns its public state", async () => {
    createSession.mockResolvedValue(sessionId);

    const response = await app.inject({
      method: "POST",
      url: "/sessions",
      payload: {},
    });

    expect(response.statusCode).toBe(201);
    expect(response.headers.location).toBe(`/sessions/${sessionId}`);
    expect(response.headers["cache-control"]).toBe("no-store");

    expect(createSession).toHaveBeenCalledExactlyOnceWith(
      createGameSession(100),
    );

    expect(response.json()).toMatchObject({
      id: sessionId,
      session: {
        balance: 100,
        bonusBet: null,
        bonus: {
          remainingSpins: 0,
          chestStatus: "not-required",
        },
      },
    });

    expect(response.json().session.bonus)
      .not.toHaveProperty("chestRewards");
  });

  it("rejects a balance supplied by the client", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/sessions",
      payload: { balance: 999999 },
    });

    expect(response.statusCode).toBe(400);

    expect(response.json()).toEqual({
      error: "Session creation accepts no fields",
    });

    expect(createSession).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON before creating a session", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/sessions",
      headers: { "content-type": "application/json" },
      payload: "{",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: "Invalid request",
    });

    expect(createSession).not.toHaveBeenCalled();
  });

  it("returns a generic error if saving fails", async () => {
    createSession.mockRejectedValue(
      new Error("Private database details"),
    );

    const response = await app.inject({
      method: "POST",
      url: "/sessions",
      payload: {},
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: "Internal server error",
    });
  });
});
});