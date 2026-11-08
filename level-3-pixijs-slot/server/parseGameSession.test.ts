import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { createGameSession } from "../src/game/GameSession.ts";
import type { GameSession } from "../src/game/GameSession.ts";
import { parseGameSession } from "./parseGameSession.ts";

const initial = createGameSession(98);

const active: GameSession = {
  ...initial,
  bonusBet: 2,
  bonus: {
    ...initial.bonus,
    remainingSpins: 7,
    stickyReels: [{ reelIndex: 1, multiplier: 3 }],
  },
};

describe("parseGameSession", () => {
  it("accepts a valid session and an active bonus", () => {
    expect(parseGameSession(initial)).toEqual(initial);
    expect(parseGameSession(active)).toEqual(active);
  });

  it.each([-1, NaN, Infinity, "98"])(
    "rejects invalid balance %s",
    (balance) => {
      expect(() =>
        parseGameSession({ ...active, balance }),
      ).toThrow(ZodError);
    },
  );

  it.each([-1, 1.5, "7"])(
    "rejects invalid spin count %s",
    (remainingSpins) => {
      expect(() =>
        parseGameSession({
          ...active,
          bonus: { ...active.bonus, remainingSpins },
        }),
      ).toThrow(ZodError);
    },
  );

  it("rejects an active bonus without its bet", () => {
    expect(() =>
      parseGameSession({ ...active, bonusBet: null }),
    ).toThrow("bonusBet");
  });

  it("accepts a finished bonus with a cleared bet", () => {
    const finished = {
      ...active,
      bonusBet: null,
      bonus: { ...active.bonus, remainingSpins: 0 },
    };

    expect(parseGameSession(finished)).toEqual(finished);
  });
});