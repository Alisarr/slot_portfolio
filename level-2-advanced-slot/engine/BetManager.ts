export class BetManager {

    private readonly betSteps = [
    1,
    5,
    10,
    25,
    50,
    100,
    250,
    500
];

private currentIndex = 2;

   getBet(): number {

    return this.betSteps[
        this.currentIndex
    ];

}

    increaseBet(): void {

    if (
        this.currentIndex <
        this.betSteps.length - 1
    ) {

        this.currentIndex++;

    }

}
    decreaseBet(): void {

    if (
        this.currentIndex > 0
    ) {

        this.currentIndex--;

    }

}

}