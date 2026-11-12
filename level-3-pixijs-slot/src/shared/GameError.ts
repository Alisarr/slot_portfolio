export type GameErrorCode =
  | "SESSION_NOT_FOUND"
  | "BONUS_NOT_ACTIVE"
  | "CHEST_NOT_PENDING"
  | "REQUEST_ID_CONFLICT"
  | "INSUFFICIENT_BALANCE"
  | "CHEST_CHOICE_REQUIRED";

export class GameError extends Error {
    readonly code: GameErrorCode;

    constructor(code: GameErrorCode, message: string) {
        super(message);

        this.name = "GameError";
        this.code = code;
    }
}