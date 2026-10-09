import { Application } from "pixi.js";

import {
  createBonusState,
  awardScatters,
  resolveFreeSpin,
  isBonusActive,
} from "./bonus/BonusState";

import{generateBoard}from "./core/generateBoard";
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

const BONUS_TRIGGER_BOARD = [
  ["scatter", "high-1", "low-3"],
  ["low-2", "scatter", "low-4"],
  ["high-2", "high-1", "scatter"],
  ["scatter", "high-2", "high-3"],
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

  let bonusState = createBonusState();
  const controls = document.createElement("div");
  controls.className = "bonus-controls";

  const bonusInfo = document.createElement("p");
  const spinButton = document.createElement("button");

  controls.append(bonusInfo, spinButton);
host.appendChild(controls);

function updateBonusDisplay(): void {
  bonusInfo.textContent =
  "Vrasheniy:" + bonusState.remainingSpins +
  "| Total Win: " + bonusState.totalWin;

  if (isBonusActive(bonusState)) {
    spinButton.textContent = "Free Spin";
  } else {
    spinButton.textContent = "Demo: Start Bonus";
  }
}

spinButton.addEventListener("click", () => {
  if (isBonusActive(bonusState)) {
    const nextBoard = generateBoard();
    
    bonusState = resolveFreeSpin(bonusState, nextBoard,0);
    slotView.renderBoard(nextBoard);
  } else {
    bonusState = awardScatters(createBonusState(), BONUS_TRIGGER_BOARD);
    slotView.renderBoard(BONUS_TRIGGER_BOARD);
  }

  updateBonusDisplay();
});

updateBonusDisplay();
  window.addEventListener("resize", () => slotView.layout());
}

void bootstrap();
