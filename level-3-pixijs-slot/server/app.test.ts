import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGameSession } from "../src/game/GameSession.ts";
import { startBonus } from "../src/bonus/startBonus.ts";
import { generateChestRewards } from "../src/bonus/generateChestRewards.ts";
import type { loadStoredSession } from "./sessionRepository.ts";
import { buildApp } from "./app.ts";

const sessionId = "33df6a40-35f1-4fc7-a7f6-9a4f922d0084";
const loadSession = vi.fn<typeof loadStoredSession>();

let app: ReturnType<typeof buildApp>;

beforeEach(() => {
  loadSession.mockReset();
  app = buildApp(loadSession);
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
    });

    const response = await app.inject({
      method: "GET",
      url: `/sessions/${sessionId}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");

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
});