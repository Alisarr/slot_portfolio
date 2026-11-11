import type { GameSession } from "../src/game/GameSession";

export function toPublicGameSession(session: GameSession) {
    const bonus = session.bonus;

    return {
        balance: session.balance,
        bonusBet: session.bonusBet,
        bonus: {
            kind: bonus.kind,
            chestStatus: bonus.chestStatus,
            selectedChestIndex: bonus.selectedChestIndex,
            remainingSpins: bonus.remainingSpins,
            totalWin: bonus.totalWin,
            winMultiplier: bonus.winMultiplier,
            wildMuliplierBoost: bonus.wildMultiplierBoost,
            symbolUpgradeActive: bonus.symbolUpgradeActive,
            stormCharge: bonus.stormCharge,
            overloadActive: bonus.overloadActive,
            stickyReels: bonus.stickyReels.map((reel) => ({
                reelIndex: reel.reelIndex,
                multiplier: reel.multiplier,
            })),
        },
    };
}