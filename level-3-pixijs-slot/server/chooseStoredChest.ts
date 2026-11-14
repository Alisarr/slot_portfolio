import type { StoredChestResult } from "./parseStoredChestResult.ts";
import { parseStoredChestResult } from "./parseStoredChestResult.ts";
import { chooseSessionChest } from "../src/game/chooseSessionChest"
import { parseGameSession } from "./parseGameSession";
import { pool } from "./db";
import { GameError } from "../src/shared/GameError";



export async function chooseStoredChest(
    id: string,
    requestId: string,
    chestIndex: number,
): Promise<StoredChestResult> {
    if(!Number.isInteger(chestIndex) || chestIndex < 0 || chestIndex > 4) {
        throw new Error("Chest index must be an integer from 0 to 4");
    }

    const client = await pool.connect();
    let discardClient = false;

    try {
        await client.query("BEGIN");

        const stored = await client.query<{ state: unknown}> (
            "SELECT state FROM game_sessions WHERE id = $1 FOR UPDATE",
            [id],
        );

        const row = stored.rows[0];

        if (row === undefined) {
            throw new GameError (
                "SESSION_NOT_FOUND",
                "Game session not found",
            );
        }

       const previous = await client.query<{
  chest_index: number;
  response: unknown;
}>(
  "SELECT chest_index, response FROM chest_requests WHERE session_id = $1 AND request_id = $2",
  [id, requestId],
);

        const saved = previous.rows[0];

        if(saved !== undefined) {
            if(saved.chest_index !== chestIndex) {
                throw new GameError(
                    "REQUEST_ID_CONFLICT",
                    "Request ID was already used with a different chest",
                );
            }

            const response = parseStoredChestResult(saved.response);
            await client.query("COMMIT");
            return response;
        }

        const session = parseGameSession(row.state);

        const nextSession = parseGameSession(
            chooseSessionChest(session, chestIndex),
        );

        const updated = await client.query<{ version: number}>(
            `UPDATE game_sessions
            SET state = $2::jsonb, version = version + 1
            WHERE id = $1
            RETURNING version`,
        [id, JSON.stringify(nextSession)],
        );

        const updateRow = updated.rows[0];


        if( updated.rowCount !== 1 || updateRow === undefined) {
            throw new GameError(
                "SESSION_NOT_FOUND",
                "Game session not found",
            );
        }

        const response = parseStoredChestResult ({
            session: nextSession,
            version: updateRow.version,
        });

        await client.query(
          "INSERT INTO chest_requests (session_id, request_id, chest_index, response) VALUES ($1, $2, $3, $4::jsonb)",
          [id, requestId, chestIndex, JSON.stringify(response)],
        );

      await client.query("COMMIT");

        return response;
    } catch (error){
        try {
            await client.query("ROLLBACK");
        } catch{
            discardClient = true;
        }

        throw error;
    } finally {
        client.release(discardClient);
    }
}