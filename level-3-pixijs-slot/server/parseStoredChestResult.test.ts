import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { createGameSession } from "../src/game/GameSession.ts";
import { parseStoredChestResult } from "./parseStoredChestResult.ts";

const session = createGameSession(100);

describe("stored chest versions", () => {
  it("reads a result with a known version", () => {
    expect(
      parseStoredChestResult({ session, version: 4 }),
    ).toEqual({
      session,
      version: 4,
    });
  });

  it("reads a legacy session with an unknown version", () => {
    expect(parseStoredChestResult(session)).toEqual({
      session,
      version: null,
    });
  });

  it("accepts an explicitly unknown version", () => {
    expect(
      parseStoredChestResult({ session, version: null }),
    ).toEqual({
      session,
      version: null,
    });
  });

  it.each([-1, 1.5, "2"])(
    "rejects an invalid version %j",
    (version) => {
      expect(() =>
        parseStoredChestResult({ session, version }),
      ).toThrow(ZodError);
    },
  );

  it("rejects a new-format result without its version", () => {
    expect(() =>
      parseStoredChestResult({ session }),
    ).toThrow(ZodError);
  });

  it("rejects an invalid session inside a result", () => {
    expect(() =>
      parseStoredChestResult({
        session: {
          ...session,
          balance: "100",
        },
        version: 1,
      }),
    ).toThrow(ZodError);
  });
});