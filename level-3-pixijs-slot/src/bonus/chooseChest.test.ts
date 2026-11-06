import { describe, expect, it } from "vitest";
import type { BonusState } from "./BonusState";
import type { ChestRewards } from "./ChestTypes";
import { createBonusState } from "./BonusState";
import { chooseChest } from "./chooseChest";

const rewards = [
  { type: "free-spins", spins: 3 },
  { type: "free-spins", spins: 5 },
  { type: "free-spins", spins: 7 },
  { type: "free-spins", spins: 10 },
  { type: "free-spins", spins: 15 },
] as const satisfies ChestRewards;

function createPendingBonus(): BonusState {
  return {
    ...createBonusState("chest"),
    remainingSpins: 10,
    chestRewards: rewards,
  };
}

describe("chooseChest", () => {
  it("applies the selected reward without changing the original state", () => {
    const before = createPendingBonus();
    const after = chooseChest(before, 2);

    expect(after.remainingSpins).toBe(17);
    expect(after.selectedChestIndex).toBe(2);
    expect(after.chestStatus).toBe("claimed");

    expect(before.remainingSpins).toBe(10);
    expect(before.selectedChestIndex).toBeNull();
    expect(before.chestStatus).toBe("pending");
  });

  it("allows the first and the last chest", () => {
    const first = chooseChest(createPendingBonus(), 0);
    const last = chooseChest(createPendingBonus(), 4);

    expect(first.remainingSpins).toBe(13);
    expect(first.selectedChestIndex).toBe(0);

    expect(last.remainingSpins).toBe(25);
    expect(last.selectedChestIndex).toBe(4);
  });

  it("rejects a second choice", () => {
    const after = chooseChest(createPendingBonus(), 1);

    expect(() => chooseChest(after, 4)).toThrow(
      "No chest reward is pending",
    );

    expect(after.remainingSpins).toBe(15);
    expect(after.selectedChestIndex).toBe(1);
  });

  it("rejects invalid chest indexes", () => {
    for (const index of [-1, 5, 1.5, NaN, Infinity]) {
      expect(() =>
        chooseChest(createPendingBonus(), index),
      ).toThrow("Chest index must be an integer from 0 to 4");
    }
  });

  it("rejects a choice when rewards have not been prepared", () => {
    const bonus: BonusState = {
      ...createPendingBonus(),
      chestRewards: null,
    };

    expect(() => chooseChest(bonus, 0)).toThrow(
      "Chest rewards are missing",
    );
  });
});