export class WinMessageRenderer {

    private element:
        HTMLElement;

    constructor() {

        const el =
            document.getElementById(
                "winMessage"
            );

        if (!el) {

            throw new Error(
                "Win message element not found"
            );

        }

        this.element = el;

    }

    showWin(): void {

        this.element.textContent =
            "You Win!";

    }

    clear(): void {

        this.element.textContent =
            "";

    }

}