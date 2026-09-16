import { getFreeSpinsAward } from "./getFreeSpinsAward";

export function addFreeSpins(
  remaining: number,
  scatterCount: number,
): number {
  const awarded = getFreeSpinsAward(scatterCount);
  return remaining + awarded;
}

export function consumeFreeSpin(remaining: number): number {
 if (remaining <= 0) {
    throw new Error("No free spins remaining");
  }
  return remaining - 1;
}