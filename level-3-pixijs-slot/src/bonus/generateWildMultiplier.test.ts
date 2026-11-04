import { describe, expect, it } from "vitest";
import { generateWildMultiplier } from "./generateWildMultiplier";

describe("generateWildMultiplier", () => {
  it("returns two below 0.7", () => {
    expect(generateWildMultiplier(() => 0)).toBe(2);
    expect(generateWildMultiplier(() => 0.699)).toBe(2);
  });

  it("returns three from 0.7 up to 0.95", () => {
    expect(generateWildMultiplier(() => 0.7)).toBe(3);
    expect(generateWildMultiplier(() => 0.949)).toBe(3);
  });

  it("returns five from 0.95 up to 1", () => {
    expect(generateWildMultiplier(() => 0.95)).toBe(5);
    expect(generateWildMultiplier(() => 0.999)).toBe(5);
  });

  it("rejects invalid random values", () => {
    const message = "Random value must be >= 0 and < 1";

    expect(() => generateWildMultiplier(() => 1)).toThrow(message);
    expect(() => generateWildMultiplier(() => -0.1)).toThrow(message);
    expect(() => generateWildMultiplier(() => NaN)).toThrow(message);
    expect(() => generateWildMultiplier(() => Infinity)).toThrow(message);
  });

  it("calls the random function once", () => {
    let calls = 0;

    const random = () => {
      calls += 1;
      return 0.8;
    };

    const multiplier = generateWildMultiplier(random);

    expect(multiplier).toBe(3);
    expect(calls).toBe(1);
  });
});