export function generateWildMultiplier(
    random: () => number = Math.random,
): number {
    const roll = random();
    if(!Number.isFinite(roll) || roll < 0 || roll >=1) {
        throw new Error("Random value must be >= 0 and < 1");
    }
    if (roll < 0.7) {
        return 2;
     }
     if (roll < 0.95) {
        return 3;
     }
     return 5;
    }