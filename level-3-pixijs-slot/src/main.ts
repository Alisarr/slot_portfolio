import { Application } from "pixi.js";

import {
  createBonusState,
  awardScatters,
  resolveFreeSpin,
  isBonusActive,
} from "./bonus/BonusState";

import { BASE_PAYLINES } from "./core/paylines";
import {getSpinWin} from "./core/getSpinWin";
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

const DEMO_TOTAL_BET = 2;

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
  let lastSpinWin = 0;
  const controls = document.createElement("div");
  controls.className = "bonus-controls";

  const bonusInfo = document.createElement("p");
  const spinButton = document.createElement("button");

  controls.append(bonusInfo, spinButton);
host.appendChild(controls);

function updateBonusDisplay(): void {
  bonusInfo.textContent =
  "Stavka Bonusa" + DEMO_TOTAL_BET.toFixed(2) +
  " | Vrasheniy:" + bonusState.remainingSpins +
  " | Za spin" + lastSpinWin.toFixed(2) +
  " | Total Win za bonus: " + bonusState.totalWin.toFixed(2);

  if (isBonusActive(bonusState)) {
    spinButton.textContent = "Free Spin";
  } else {
    spinButton.textContent = "Demo: Start Bonus";
  }
}

spinButton.addEventListener("click", () => {
  if (isBonusActive(bonusState)) {
    const nextBoard = generateBoard();

    const spinWin = getSpinWin(
      nextBoard,
      BASE_PAYLINES,
      DEMO_TOTAL_BET,
    );

    
    bonusState = resolveFreeSpin(
    bonusState,
     nextBoard,
     spinWin,
    );

    lastSpinWin = spinWin;

    slotView.renderBoard(nextBoard);
  } else {
    bonusState = awardScatters
    (createBonusState(),
    BONUS_TRIGGER_BOARD,
  );
  lastSpinWin = 0;


  slotView.renderBoard(BONUS_TRIGGER_BOARD);
  }

  updateBonusDisplay();
});

updateBonusDisplay();
  window.addEventListener("resize", () => slotView.layout());
}

void bootstrap();
