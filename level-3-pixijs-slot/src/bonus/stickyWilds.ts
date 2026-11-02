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

export function collectStickyWilds(
    board: Board,
    stickyReels: readonly StickyWildReel[],
    createMultiplier: () => number,
): StickyWildReel[] {
    const nextStickyReels = [...stickyReels];
    const reelIndexes = [0, 1, 2, 3, 4] as const;

    for (const reelIndex of reelIndexes) {
        const alredySticky = nextStickyReels.some(
            (stickyReel) =>  stickyReel.reelIndex === reelIndex,
        );

        if (alredySticky) {
            continue;
        }

        const hasWild = board[reelIndex].includes("wild");

        if (hasWild) {
            nextStickyReels.push({
                reelIndex: reelIndex,
                multiplier: createMultiplier(),
            });
        }
    }
    
    return nextStickyReels;
}