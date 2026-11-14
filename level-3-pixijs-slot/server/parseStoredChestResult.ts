import { z } from "zod";
import type { GameSession } from "../src/game/GameSession.ts";
import { parseGameSession } from "./parseGameSession.ts";

export interface StoredChestResult {
  readonly session: GameSession;
  readonly version: number | null;
}

const storedChestSchema = z.strictObject({
  session: z.unknown(),
  version: z.number().int().nonnegative().nullable(),
});

export function parseStoredChestResult(
  value: unknown,
): StoredChestResult {
  if (
    typeof value === "object" &&
    value !== null &&
    "session" in value
  ) {
    const result = storedChestSchema.parse(value);

    return {
      session: parseGameSession(result.session),
      version: result.version,
    };
  }

  return {
    session: parseGameSession(value),
    version: null,
  };
}