import type { Board } from "../core/types";
import { countScatters } from "../core/countScatters";
import { addFreeSpins, consumeFreeSpin } from "./freeSpins";
import type { StickyWildReel } from "./stickyWilds";

export interface BonusState {
  remainingSpins: number;
  totalWin: number;
  stormCharge: number;
  overloadActive: boolean;
  stickyReels: readonly StickyWildReel[];
}

export function createBonusState(): BonusState {
  return {
    remainingSpins: 0,
    totalWin: 0,
    stormCharge: 0,
    overloadActive: false,
    stickyReels: [],
  };
}

export function awardScatters(
  state: BonusState,
  board: Board,
): BonusState {
  const scatterCount = countScatters(board);

  return {
    ...state,
    remainingSpins: addFreeSpins(state.remainingSpins, scatterCount),
  };
}

export function resolveFreeSpin(
  state: BonusState,
  board: Board,
  spinWin: number,
): BonusState {
  const remainingAfterSpin = consumeFreeSpin(state.remainingSpins);
  const scatterCount = countScatters(board);

  return {
    ...state,
    remainingSpins: addFreeSpins(remainingAfterSpin, scatterCount),
    totalWin: state.totalWin + spinWin,
  };
}

export function isBonusActive(state: BonusState): boolean {
  return state.remainingSpins > 0;
}