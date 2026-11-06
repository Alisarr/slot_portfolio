import type { Board } from "../core/types";
import { countScatters } from "../core/countScatters";
import { addFreeSpins, consumeFreeSpin } from "./freeSpins";
import type { StickyWildReel } from "./stickyWilds";
import type { ChestRewards  } from "./ChestTypes";

export type BonusKind = "standard" | "chest";
export type ChestStatus = "not-required" | "pending" | "claimed";

export interface BonusState {
  kind: BonusKind,
  chestStatus: ChestStatus;
  remainingSpins: number;
  totalWin: number;
  stormCharge: number;
  overloadActive: boolean;
  stickyReels: readonly StickyWildReel[];
  chestRewards: ChestRewards | null;
  selectedChestIndex: number | null;
}

export function createBonusState(
  kind: BonusKind = "standard",
): BonusState {
  return {
    kind,
    chestStatus: kind === "chest" ? "pending" : "not-required",
    remainingSpins: 0,
    totalWin: 0,
    stormCharge: 0,
    overloadActive: false,
    stickyReels: [],
    chestRewards: null,
    selectedChestIndex: null,
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

export function isChestChoicePending(state: BonusState): boolean {
  return state.kind === "chest" && state.chestStatus === "pending";
}