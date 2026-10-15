import { getPaylineWin } from "./payouts";

import type {
  Board,
  Payline,
  PaylineMatch,
  PaylineWin,
} from "./types";

export function evaluatePayline(
  board: Board,
  payline: Payline,
): PaylineMatch | null {
  let matchSymbol = board[0][payline[0]];

  // Wild and Scatter rules will be introduced as their own tested milestone.
  if (matchSymbol === "scatter") {
    return null;
  }

  let matchingCount = 1;
  let leadingWildCount = matchSymbol === "wild" ? 1 : 0;

  for (let reelIndex = 1; reelIndex < board.length; reelIndex += 1) {
    const rowIndex = payline[reelIndex];
    const symbol = board[reelIndex][rowIndex];

    if (symbol === "scatter") {
      break;
    }

    if (matchSymbol === "wild") {
      if (symbol === "wild") {
        leadingWildCount += 1;
      }
      matchSymbol = symbol;
    }

    if (symbol !== matchSymbol && symbol !== "wild") {
      break;
    }

    matchingCount += 1;
  }

  if (matchingCount < 3) {
    return null;
  }
  const symbolMatch: PaylineMatch = {
    symbol: matchSymbol,
    count: matchingCount,
  };

  if (leadingWildCount < 3) {
    return symbolMatch;
  }
  
  const wildMatch: PaylineMatch = {
    symbol: "wild",
    count: leadingWildCount,
  }

  const symbolPayout = getPaylineWin(symbolMatch, 1);
  const wildPayout = getPaylineWin(wildMatch, 1);

  if (wildPayout > symbolPayout) {
    return wildMatch;
  }

  return symbolMatch;
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
