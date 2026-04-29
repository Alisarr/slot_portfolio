import type { SymbolConfig }
    from "../src/config/symbols";

    
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
    symbols: SymbolConfig[]
    ): void {

    this.reelsElement.innerHTML =
      symbols
       .map(
        symbol =>
        `<img 
        src="${symbol.image}" 
        width="80"
        />`
        )
     .join("");

    }

}