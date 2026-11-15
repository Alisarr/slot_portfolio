import { describe, expect, it } from "vitest";
import { decideSessionUpdate } from "./decideSessionUpdate";

describe("decideSessionUpdate", () => {
  it.each([
    [null, 0, "apply"],
    [null, 7, "apply"],
    [0, 0, "ignore"],
    [0, 1, "apply"],
    [2, 3, "apply"],
    [2, 2, "ignore"],
    [2, 1, "ignore"],
    [2, null, "refresh"],
    [null, null, "refresh"],
  ] as const)(
    "current %s, incoming %s -> %s",
    (currentVersion, incomingVersion, expected) => {
      const decision = decideSessionUpdate(
        { sessionId: "session-a", version: currentVersion },
        { sessionId: "session-a", version: incomingVersion },
      );

      expect(decision).toBe(expected);
    },
  );

  it("ignores a higher version from a different session", () => {
    const decision = decideSessionUpdate(
      { sessionId: "session-b", version: 0 },
      { sessionId: "session-a", version: 100 },
    );

    expect(decision).toBe("ignore");
  });

  it("does not request a refresh for a different session", () => {
    const decision = decideSessionUpdate(
      { sessionId: "session-b", version: 0 },
      { sessionId: "session-a", version: null },
    );

    expect(decision).toBe("ignore");
  });
});