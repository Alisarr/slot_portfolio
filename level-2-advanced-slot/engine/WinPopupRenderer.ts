 export class WinPopupRenderer {

    private popupElement:
        HTMLElement;

    constructor() {

        const element =
            document.getElementById(
                "winPopup"
            );

        if (!element) {

            throw new Error(
                "Win popup element not found"
            );

        }

        this.popupElement =
            element;

    }

    showWin(
        amount: number
    ): void {

        this.popupElement.textContent =
            `+${amount} Coins`;

        this.popupElement.classList.add(
            "show"
        );

        setTimeout(
            () => {

                this.hide();

            },
            2000
        );

    }

    private hide(): void {

        this.popupElement.classList.remove(
            "show"
        );

    }

}