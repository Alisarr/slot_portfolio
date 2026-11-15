import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { SessionStore } from "./SessionStore";
import { refreshSession } from "./refreshSession";
import type { PublicGameSession } from "./sessionSchemas";

const sessionId = "33df6a40-35f1-4fc7-a7f6-9a4f922d0084";
const baseUrl = "http://127.0.0.1:3000/";

function body(version = 0, balance = 100) {
  const session: PublicGameSession = {
    balance,
    bonusBet: null,
    bonus: {
      kind: "standard",
      chestStatus: "not-required",
      selectedChestIndex: null,
      remainingSpins: 0,
      totalWin: 0,
      winMultiplier: 1,
      wildMultiplierBoost: 0,
      symbolUpgradeActive: false,
      stormCharge: 0,
      overloadActive: false,
      stickyReels: [],
    },
  };

  return { id: sessionId, version, session };
}

function json(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    headers: { "Content-Type": "application/json" },
  });
}

const fetcher = vi.fn<typeof fetch>();
let store: SessionStore<PublicGameSession>;

beforeEach(() => {
  fetcher.mockReset();
  store = new SessionStore<PublicGameSession>(sessionId);

  store.receive({
    sessionId,
    version: 0,
    session: body().session,
  });
});

describe("refreshSession", () => {
  it("loads the first session through GET and saves it", async () => {
    store = new SessionStore<PublicGameSession>(sessionId);
    fetcher.mockResolvedValue(json(body()));

    await expect(
      refreshSession(store, baseUrl, fetcher),
    ).resolves.toBe("apply");

    expect(fetcher).toHaveBeenCalledExactlyOnceWith(
      `http://127.0.0.1:3000/sessions/${sessionId}`,
      { method: "GET", cache: "no-store" },
    );

    expect(store.getState()).toEqual({
      sessionId,
      version: 0,
      session: body().session,
    });
  });

  it.each([404, 500])("keeps state on HTTP %i", async (status) => {
    const before = store.getState();

    fetcher.mockResolvedValue(
      new Response("private server details", { status }),
    );

    await expect(
      refreshSession(store, baseUrl, fetcher),
    ).rejects.toThrow(`Failed to load session (HTTP ${status})`);

    expect(store.getState()).toEqual(before);
  });

  it.each([
    ["unknown version", { ...body(1, 98), version: null }],
    ["invalid balance", body(1, -1)],
    [
      "missing bonus",
      {
        ...body(1, 98),
        session: { balance: 98, bonusBet: null },
      },
    ],
  ])("keeps state on %s", async (_name, invalidBody) => {
    const before = store.getState();
    fetcher.mockResolvedValue(json(invalidBody));

    await expect(
      refreshSession(store, baseUrl, fetcher),
    ).rejects.toThrow(ZodError);

    expect(store.getState()).toEqual(before);
  });

  it("rejects a response belonging to another session", async () => {
    const before = store.getState();

    fetcher.mockResolvedValue(json({
      ...body(1, 98),
      id: "de4bff1e-aa0f-4bac-92bb-8d7dae52eb26",
    }));

    await expect(
      refreshSession(store, baseUrl, fetcher),
    ).rejects.toThrow("Session response ID mismatch");

    expect(store.getState()).toEqual(before);
  });

  it("keeps state when the response is not valid JSON", async () => {
    const before = store.getState();
    fetcher.mockResolvedValue(new Response("{broken"));

    await expect(
      refreshSession(store, baseUrl, fetcher),
    ).rejects.toThrow(SyntaxError);

    expect(store.getState()).toEqual(before);
  });

  it("keeps state when the network request fails", async () => {
    const before = store.getState();
    fetcher.mockRejectedValue(new TypeError("Network unavailable"));

    await expect(
      refreshSession(store, baseUrl, fetcher),
    ).rejects.toThrow("Network unavailable");

    expect(store.getState()).toEqual(before);
  });

  it("keeps version 2 when the response with version 1 arrives last", async () => {
    let resolveFirst!: (response: Response) => void;

    const delayed = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });

    fetcher
      .mockReturnValueOnce(delayed)
      .mockResolvedValueOnce(json(body(2, 96)));

    const first = refreshSession(store, baseUrl, fetcher);
    const second = refreshSession(store, baseUrl, fetcher);

    await expect(second).resolves.toBe("apply");

    resolveFirst(json(body(1, 98)));

    await expect(first).resolves.toBe("ignore");

    expect(store.getState()).toEqual({
      sessionId,
      version: 2,
      session: body(2, 96).session,
    });
  });
});