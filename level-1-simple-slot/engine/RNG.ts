export class RNG {

    private symbols: string[] = [
        "🍒",
        "🍋",
        "🔔",
        "⭐",
        "7️⃣"
    ];

    getRandomSymbol(): string {

        const randomIndex = Math.floor(
            Math.random() * this.symbols.length
        );

        return this.symbols[randomIndex];

    }

}