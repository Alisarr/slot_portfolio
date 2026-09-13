import { Application } from "pixi.js";

import "./style.css";
import type { Board } from "./core/types";
import { PixiSlotView } from "./view/PixiSlotView";

const DEMO_BOARD = [
  ["low-1", "high-1", "low-3"],
  ["low-2", "high-1", "low-4"],
  ["high-2", "high-1", "low-1"],
  ["low-4", "high-2", "high-3"],
  ["low-3", "scatter", "wild"],
] as const satisfies Board;

async function bootstrap(): Promise<void> {
  const host = document.querySelector<HTMLElement>("#app");

  if (!host) {
    throw new Error("Application root was not found");
  }

  const app = new Application();

  await app.init({
    resizeTo: window,
    background: 0x090714,
    antialias: true,
  });

  host.appendChild(app.canvas);

  const slotView = new PixiSlotView(app);
  slotView.renderBoard(DEMO_BOARD);

  window.addEventListener("resize", () => slotView.layout());
}

void bootstrap();
