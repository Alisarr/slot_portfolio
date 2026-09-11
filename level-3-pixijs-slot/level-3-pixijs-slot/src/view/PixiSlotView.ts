import { Container, Graphics, Text } from "pixi.js";
import type { Application } from "pixi.js";

import type { Board } from "../core/types";

const CELL_SIZE = 104;
const CELL_GAP = 10;

export class PixiSlotView {
  private readonly boardContainer = new Container();

  public constructor(private readonly app: Application) {
    this.app.stage.addChild(this.boardContainer);
  }

  public renderBoard(board: Board): void {
    this.boardContainer.removeChildren();

    for (let reelIndex = 0; reelIndex < board.length; reelIndex += 1) {
      const reel = board[reelIndex];

      for (let rowIndex = 0; rowIndex < reel.length; rowIndex += 1) {
        const symbol = reel[rowIndex];
        const x = reelIndex * (CELL_SIZE + CELL_GAP);
        const y = rowIndex * (CELL_SIZE + CELL_GAP);

        const cell = new Graphics()
          .roundRect(x, y, CELL_SIZE, CELL_SIZE, 14)
          .fill({ color: 0x241a45 });

        const label = new Text({
          text: symbol.toUpperCase(),
          style: {
            fill: 0xf4f0ff,
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 15,
            fontWeight: "600",
          },
        });

        label.anchor.set(0.5);
        label.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 2);
        this.boardContainer.addChild(cell, label);
      }
    }

    this.layout();
  }

  public layout(): void {
    this.boardContainer.position.set(
      (this.app.screen.width - this.boardContainer.width) / 2,
      (this.app.screen.height - this.boardContainer.height) / 2,
    );
  }
}
