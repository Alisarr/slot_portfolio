import type { PaylineMatch } from "../core/types";
import type { StickyWildReel } from "./stickyWilds";

export function getStickyWildMultiplier(
    match: PaylineMatch,
    stickyReels: readonly StickyWildReel[],
): number {
    let totalMultiplier = 0;

    for (const stickyReel of stickyReels) {
        if (stickyReel.reelIndex >= match.count) {
            continue;
        }

        if (stickyReel.multiplier > 1) {
            totalMultiplier += stickyReel.multiplier;
        }
        }
        if (totalMultiplier === 0) {
            return 1;
        }
       return totalMultiplier;
    }