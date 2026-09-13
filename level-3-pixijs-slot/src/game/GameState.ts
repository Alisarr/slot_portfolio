export const GAME_STATES = [
  "boot",
  "idle",
  "spinning",
  "evaluating",
  "presenting",
  "bonus-intro",
  "bonus-spinning",
  "bonus-summary",
] as const;

export type GameState = (typeof GAME_STATES)[number];
