import type { GameSession } from "../src/game/GameSession";
import { chooseSessionChest } from "../src/game/chooseSessionChest"
import { parseGameSession } from "./parseGameSession";
import { pool } from "./db";


export async function chooseStoredChest(
    id: string,
    requestId: string,
    chestIndex: number,
): Promise<GameSession> {
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
            throw new Error ("Game session not found");
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
                throw new Error("Request ID was already used with a different chest");
            }

            const response = parseGameSession(saved.response);

            await client.query("COMMIT");
            return response;
        }

        const session = parseGameSession(row.state);

        const response = parseGameSession(
            chooseSessionChest(session, chestIndex),
        );

        const updated = await client.query(
            "UPDATE game_sessions SET state = $2::jsonb WHERE id = $1",
        [id, JSON.stringify(response)],
        );

        if( updated.rowCount !== 1) {
            throw new Error("Game session not found");
        }

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