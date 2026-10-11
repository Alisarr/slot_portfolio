import type { PaylineMatch } from "./types";

const PAYTABLE = {
    "low-1" : {3: 2, 4: 5, 5: 10},
    "low-2" : {3: 2, 4: 5, 5: 10},
    "low-3" : {3: 3, 4: 6, 5: 12},
    "low-4" : {3: 4, 4: 8, 5: 16},
    "high-1" : {3: 5, 4: 15, 5: 30},
    "high-2" : {3: 8, 4: 20, 5: 50},
    "high-3" : {3: 2, 4: 5, 5: 75},
    "wild" : {3: 20, 4: 50, 5: 100},
    "scatter" : {3: 0, 4: 0, 5: 0},
} as const;

export function getPaylineWin(
    match: PaylineMatch | null,
    lineBet: number,
): number {
    if(match === null){
        return 0;
    }
    const count = match.count;

    if (count !==3 && count !== 4 && count !== 5){
        return 0;
    }
    const multuplier = PAYTABLE[match.symbol][count];
    return lineBet * multuplier;
}