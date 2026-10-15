export const SYMBOL_IDS = [
  "low-1",
  "low-2",
  "low-3",
  "low-4",
  "high-1",
  "high-2",
  "high-3",
  "wild",
  "scatter",
] as const;

export type SymbolId = (typeof SYMBOL_IDS)[number];

export type RowIndex = 0 | 1 | 2;

export type Reel = readonly [SymbolId, SymbolId, SymbolId];

// The board is stored reel-first: board[reelIndex][rowIndex].
export type Board = readonly [Reel, Reel, Reel, Reel, Reel];

// Each number selects one row from the corresponding reel.
export type Payline = readonly [
  RowIndex,
  RowIndex,
  RowIndex,
  RowIndex,
  RowIndex,
];

export interface PaylineMatch {
  readonly symbol: SymbolId;
  readonly count: number;
}

export interface PaylineWin extends PaylineMatch {
  readonly paylineIndex: number;
}

export interface PaylinePayout extends PaylineWin {
  readonly amount: number ;
}

export interface SpinResults {
  readonly lineWins: readonly PaylinePayout[];
  readonly totalWin: number;
  readonly scatterCount: number;
}