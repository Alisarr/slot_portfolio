export class ReelsRenderer {

    private reelsElement:
        HTMLElement;

    constructor() {

        const element =
            document.getElementById(
                "reels"
            );

        if (!element) {

            throw new Error(
                "Reels element not found"
            );

        }

        this.reelsElement =
            element;

    }

    render(
        symbols: string[]
    ): void {

        this.reelsElement.textContent =
            symbols.join(" ");

    }

}