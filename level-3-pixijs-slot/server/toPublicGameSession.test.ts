import { describe, expect, it } from "vitest";
import { createGameSession } from "../src/game/GameSession.ts";
import { chooseSessionChest } from "../src/game/chooseSessionChest.ts";
import { startBonus } from "../src/bonus/startBonus.ts";
import { toPublicGameSession } from "./toPublicGameSession.ts";

const rewards = [
  { type: "free-spins", spins: 5 },
  { type: "bonus-multiplier", multiplier: 3 },
  { type: "sticky-wild", reelIndex: 2 },
  { type: "wild-boost", amount: 1 },
  { type: "symbol-upgrade" },
] as const;

function createPendingSession() {
  return {
    ...createGameSession(98),
    bonusBet: 2,
    bonus: startBonus(4, () => rewards),
  };
}

describe("toPublicGameSession", () => {
  it("hides pending chest rewards without changing the session", () => {
    const session = createPendingSession();
    const before = structuredClone(session);

    const result = toPublicGameSession(session);

    expect(result).toMatchObject({
      balance: 98,
      bonusBet: 2,
      bonus: {
        kind: "chest",
        chestStatus: "pending",
        remainingSpins: 15,
        selectedChestIndex: null,
      },
    });

    expect(result.bonus).not.toHaveProperty("chestRewards");
    expect(session).toEqual(before);
    expect(session.bonus.chestRewards).toEqual(rewards);
  });

  it("keeps the chosen chest and active effects but hides the reward list", () => {
    const session = chooseSessionChest(createPendingSession(), 1);

    const result = toPublicGameSession(session);

    expect(result.bonus).toMatchObject({
      chestStatus: "claimed",
      selectedChestIndex: 1,
      remainingSpins: 15,
      winMultiplier: 3,
    });

    expect(result.bonus).not.toHaveProperty("chestRewards");
  });

  it("copies sticky reels so the response cannot change the original session", () => {
    const session = chooseSessionChest(createPendingSession(), 2);
    const before = structuredClone(session);

    const result = toPublicGameSession(session);

    expect(result.bonus.stickyReels).toEqual([
      { reelIndex: 2, multiplier: 1 },
    ]);

    result.balance = 0;
    result.bonus.remainingSpins = 0;
    result.bonus.stickyReels[0].multiplier = 99;
    result.bonus.stickyReels.push({
      reelIndex: 4,
      multiplier: 5,
    });

    expect(session).toEqual(before);
  });

  it("handles a session without an active bonus", () => {
    const result = toPublicGameSession(createGameSession(100));

    expect(result).toMatchObject({
      balance: 100,
      bonusBet: null,
      bonus: {
        kind: "standard",
        chestStatus: "not-required",
        remainingSpins: 0,
        selectedChestIndex: null,
        stickyReels: [],
      },
    });

    expect(result.bonus).not.toHaveProperty("chestRewards");
  });

  it("does not expose additional internal fields", () => {
    const session = chooseSessionChest(createPendingSession(), 2);

    const internalSession = {
      ...session,
      internalToken: "server-only",
      bonus: {
        ...session.bonus,
        internalSeed: 123,
        stickyReels: session.bonus.stickyReels.map((reel) => ({
          ...reel,
          internalWeight: 42,
        })),
      },
    };

    const result = toPublicGameSession(internalSession);

    expect(result).not.toHaveProperty("internalToken");
    expect(result.bonus).not.toHaveProperty("internalSeed");

    expect(result.bonus.stickyReels[0])
      .not.toHaveProperty("internalWeight");
  });
});