import type { GameErrorCode } from "../src/shared/GameError.ts";

export const GAME_ERROR_STATUS: Record<GameErrorCode, number> = {
  SESSION_NOT_FOUND: 404,
  BONUS_NOT_ACTIVE: 409,
  CHEST_NOT_PENDING: 409,
  REQUEST_ID_CONFLICT: 409,
  INSUFFICIENT_BALANCE: 409,
  CHEST_CHOICE_REQUIRED: 409,
};