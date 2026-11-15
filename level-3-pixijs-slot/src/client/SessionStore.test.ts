import { beforeEach, describe, expect, it } from "vitest";
import { SessionStore } from "./SessionStore";
import type { SessionResponse } from "./SessionStore";

interface TestSession {
  balance: number;
  bonus: { remainingSpins: number };
}

function response(
  version: number | null,
  balance: number,
  remainingSpins = 0,
): SessionResponse<TestSession> {
  return {
    sessionId: "session-a",
    version,
    session: { balance, bonus: { remainingSpins } },
  };
}

let store: SessionStore<TestSession>;

beforeEach(() => {
  store = new SessionStore<TestSession>("session-a");
});

describe("SessionStore", () => {
  it("starts empty and accepts the first known version", () => {
    expect(store.getState()).toEqual({
      sessionId: "session-a",
      version: null,
      session: null,
    });

    const initial = response(0, 100);

    expect(store.receive(initial)).toBe("apply");
    expect(store.getState()).toEqual(initial);
  });

  it("keeps the newer balance and bonus when an older response arrives", () => {
    const first = response(1, 98, 10);
    const second = response(2, 104, 9);

    expect(store.receive(first)).toBe("apply");
    expect(store.receive(second)).toBe("apply");
    expect(store.receive(first)).toBe("ignore");

    expect(store.getState()).toEqual(second);
  });

  it("does not replace state when the version is equal", () => {
    const current = response(2, 104, 9);
    store.receive(current);

    expect(store.receive(response(2, 0, 0))).toBe("ignore");
    expect(store.getState()).toEqual(current);
  });

  it.each([false, true])(
    "keeps state when the incoming version is unknown; loaded=%s",
    (loaded) => {
      if (loaded) store.receive(response(2, 104, 9));

      const before = store.getState();

      expect(store.receive(response(null, 98, 10))).toBe("refresh");
      expect(store.getState()).toEqual(before);
    },
  );

  it("rejects another session even before the first state is loaded", () => {
    const before = store.getState();

    const other = {
      ...response(100, 999),
      sessionId: "session-b",
    };

    expect(store.receive(other)).toBe("ignore");
    expect(store.getState()).toEqual(before);
  });

  it("accepts a replay with a newer version and stores only session data", () => {
    store.receive(response(2, 104, 9));

    const newer = response(3, 106, 8);
    const replay = { ...newer, replayed: true };

    expect(store.receive(replay)).toBe("apply");
    expect(store.getState()).toEqual(newer);
  });

  it("does not share nested objects with the received response", () => {
    const incoming = response(1, 98, 10);
    store.receive(incoming);

    incoming.session.balance = 0;
    incoming.session.bonus.remainingSpins = 999;

    expect(store.getState()).toEqual(response(1, 98, 10));
  });

  it("does not expose its internal nested objects through getState", () => {
    store.receive(response(1, 98, 10));

    const copy = store.getState();

    if (copy.session === null) {
      throw new Error("Expected a loaded session");
    }

    copy.session.balance = 0;
    copy.session.bonus.remainingSpins = 999;

    expect(store.getState()).toEqual(response(1, 98, 10));
  });
});