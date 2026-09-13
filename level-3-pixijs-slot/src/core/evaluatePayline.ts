import type {
  Board,
  Payline,
  PaylineMatch,
  PaylineWin,
  SymbolId,
} from "./types";

const SPECIAL_SYMBOLS: readonly SymbolId[] = ["wild", "scatter"];

export function evaluatePayline(
  board: Board,
  payline: Payline,
): PaylineMatch | null {
  const firstSymbol = board[0][payline[0]];

  // Wild and Scatter rules will be introduced as their own tested milestone.
  if (SPECIAL_SYMBOLS.includes(firstSymbol)) {
    return null;
  }

  let matchingCount = 1;

  for (let reelIndex = 1; reelIndex < board.length; reelIndex += 1) {
    const rowIndex = payline[reelIndex];
    const symbol = board[reelIndex][rowIndex];

    if (symbol !== firstSymbol) {
      break;
    }

    matchingCount += 1;
  }

  if (matchingCount < 3) {
    return null;
  }

  return {
    symbol: firstSymbol,
    count: matchingCount,
  };
}

export function evaluatePaylines(
  board: Board,
  paylines: readonly Payline[],
): PaylineWin[] {
  const wins: PaylineWin[] = [];

  for (let paylineIndex = 0; paylineIndex < paylines.length; paylineIndex += 1) {
    const payline = paylines[paylineIndex];
    const match = evaluatePayline(board, payline);

    if (match !== null) {
      wins.push({
        paylineIndex: paylineIndex,
        symbol: match.symbol,
        count: match.count,
      });
    }
  }

  return wins;
}
