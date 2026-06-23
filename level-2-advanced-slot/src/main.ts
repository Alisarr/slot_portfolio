import "./style.css";

import {
    GameState,
    GameStateManager
} from "../engine/GameState";



console.log("Level 2 started");

import { SpinController }
    from "../engine/SpinController";

const gameStateManager =
    new GameStateManager();
    
const spinController =
  new SpinController(
  gameStateManager
  );

const spinButton =
  document.getElementById(
  "spinButton"
  );

  spinButton?.addEventListener(
    "click",
    () => {
      console.log("spin() entered");
      
        spinController.spin();

    }
 );
 console.log("Auto spin");
  spinController.spin();

console.log(
    "Current state:",
    gameStateManager.getState()
);