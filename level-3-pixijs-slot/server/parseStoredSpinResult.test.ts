import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import type { Board } from "../src/core/types.ts";
import { createGameSession } from "../src/game/GameSession.ts";
import { parseStoredSpinResult } from "./parseStoredSpinResult.ts";

const board = [
  ["low-1", "low-1", "low-1"],
  ["low-2", "low-2", "low-2"],
  ["low-3", "low-3", "low-3"],
  ["low-4", "low-4", "low-4"],
  ["high-1", "high-1", "high-1"],
] as const satisfies Board;

// Старый сохранённый результат: поля version ещё нет.
const legacyResult = {
  mode: "paid",
  session: createGameSession(98),
  board,
  boardBeforeExpansion: board,
  spin: {
    lineWins: [],
    totalWin: 0,
    scatterCount: 0,
  },
};

describe("stored spin versions", () => {
  it("keeps a known version", () => {
    const result = parseStoredSpinResult({
      ...legacyResult,
      version: 7,
    });

    expect(result.version).toBe(7);
  });

  it("reads old results with an unknown version", () => {
    const result = parseStoredSpinResult(legacyResult);

    expect(result.version).toBeNull();
    expect(result.session.balance).toBe(98);
  });

  it("accepts an explicitly unknown version", () => {
    const result = parseStoredSpinResult({
      ...legacyResult,
      version: null,
    });

    expect(result.version).toBeNull();
  });

  it.each([-1, 1.5, "2"])(
    "rejects an invalid version %j",
    (version) => {
      expect(() =>
        parseStoredSpinResult({
          ...legacyResult,
          version,
        }),
      ).toThrow(ZodError);
    },
  );
});