import { describe, expect, it } from "vitest";
import { addFreeSpins, consumeFreeSpin } from "./freeSpins";

describe("free spins", () => {
  it("starts a bonus with ten spins for three scatters", () => {
    expect(addFreeSpins(0, 3)).toBe(10);
  });

  it("consumes one free spin", () => {
    expect(consumeFreeSpin(10)).toBe(9);
  });
  it ("Povtornoe Nachislenie bonusov", () => { 
    expect(addFreeSpins(7, 3)).toBe(17);
 });
 it ("Ne dostatocno Scatters", () => {
    expect(addFreeSpins(7, 2)).toBe(7);
 });
 it ("Poslednee Vraschenie bonusov", () => {
    expect(consumeFreeSpin(1)).toBe(0);
 });
 it ("Net vrascheniy bonusov", () => {
    expect(() => consumeFreeSpin(0)).toThrow("No free spins remaining");
 });
 it("adds more spins on the last free spin", () => {
  let remaining = addFreeSpins(0, 3);
  expect(remaining).toBe(10);

  for (let spin = 0; spin < 9; spin += 1) {
    remaining = consumeFreeSpin(remaining);
  }

  expect(remaining).toBe(1);

  remaining = consumeFreeSpin(remaining);
  expect(remaining).toBe(0);

  // На последнем вращении выпали ещё три scatter.
  remaining = addFreeSpins(remaining, 3);
  expect(remaining).toBe(10);
});
});
