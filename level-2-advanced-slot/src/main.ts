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

  spinController.spin();

console.log(
    "Current state:",
    gameStateManager.getState()
);