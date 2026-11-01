import type { Board, Reel } from "../core/types";
export interface StickyWildReel {
    readonly reelIndex: 0 | 1 | 2 | 3 | 4;
    readonly multiplier: number;
}

export function applyStickyWilds(
    board: Board,
    stickyReels: readonly StickyWildReel[],
): Board {
    const nextBoard: [Reel, Reel, Reel, Reel, Reel] = [...board];

    for(const stickyReel of stickyReels) {
        nextBoard[stickyReel.reelIndex] = ["wild", "wild", "wild"];
    }

    return nextBoard;
}