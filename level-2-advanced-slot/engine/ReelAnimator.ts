export class ReelAnimator {

    async spinReel(
        reelIndex: number
    ): Promise<string> {

        console.log(
            "Reel",
            reelIndex,
            "spinning..."
        );

        await this.delay(
            1000 + reelIndex * 500
        );

        console.log(
            "Reel",
            reelIndex,
            "stopped"
        );

        return "🎰";

    }

    private delay(
        ms: number
    ): Promise<void> {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    ms
                )
        );

    }

}