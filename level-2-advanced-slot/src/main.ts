import {
    GameState,
    GameStateManager
} from "../engine/GameState";

console.log("Level 2 started");

const gameStateManager =
    new GameStateManager();

console.log(
    "Current state:",
    gameStateManager.getState()
);