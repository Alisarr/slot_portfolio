import { describe, expect, it } from "vitest";
import { getPaylineWin } from "./payouts.ts";

describe("getPaylineWin", () => {
  it("uses the matching count and the line bet", () => {
    expect(
      getPaylineWin({ symbol: "low-1", count: 3 }, 2),
    ).toBe(4);

    expect(
      getPaylineWin({ symbol: "low-1", count: 4 }, 2),
    ).toBe(10);

    expect(
      getPaylineWin({ symbol: "low-1", count: 5 }, 2),
    ).toBe(20);
  });

  it("pays for a wild-only combination", () => {
    expect(
      getPaylineWin({ symbol: "wild", count: 3 }, 2),
    ).toBe(40);
  });

  it("returns zero when there is no match", () => {
    expect(getPaylineWin(null, 2)).toBe(0);
  });

  it("does not pay scatters as a line combination", () => {
    expect(
      getPaylineWin({ symbol: "scatter", count: 3 }, 2),
    ).toBe(0);
  });
});