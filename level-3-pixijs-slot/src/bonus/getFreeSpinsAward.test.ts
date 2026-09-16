import { describe, expect, it } from "vitest";
import { getFreeSpinsAward } from "./getFreeSpinsAward";

describe("getFreeSpinsAward", () => {
  it("awards no spins below three scatters", () => {
    expect(getFreeSpinsAward(0)).toBe(0);
    expect(getFreeSpinsAward(2)).toBe(0);
  });

  it("awards ten spins for three scatters", () => {
    expect(getFreeSpinsAward(3)).toBe(10);
  });

  it("awards fifteen spins for four scatters", () => {
    expect(getFreeSpinsAward(4)).toBe(15);
  });

  it("awards twenty spins for five or more scatters", () => {
    expect(getFreeSpinsAward(5)).toBe(20);
    expect(getFreeSpinsAward(6)).toBe(20);
  });
}); 