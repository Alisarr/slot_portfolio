import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { chooseStoredChest } from "./chooseStoredChest"
import { toPublicGameSession } from "./toPublicGameSession";
import { GameError } from "../src/shared/GameError";
import { GAME_ERROR_STATUS } from "./gameErrorStatus";


const sessionIdSchema = z.uuid();

const chestBodySchema = z.strictObject ({
    requestId: z.uuid(),
    chestIndex: z.number().int().min(0).max(4),
});


export function registerChestRoutes(
    app: FastifyInstance,
    chooseChest: typeof chooseStoredChest,
): void {
    app.post<{ Params: { id: string} }>(
        "/sessions/:id/chest",
        async (request, reply) => {
            reply.header("Cache-Control", "no-store");

            const parsedId = sessionIdSchema.safeParse(request.params.id);
            const parsedBody = chestBodySchema.safeParse(request.body);

            if (!parsedId.success || !parsedBody.success) {
                return reply.code(400).send({
                    error: "Invalid chest request",
                });
            }

            const { requestId, chestIndex } = parsedBody.data;

            try  {
                const session = await chooseChest(
                    parsedId.data,
                    requestId,
                    chestIndex,
                );

                return {
                    requestId,
                    session: toPublicGameSession(session),
                };
               } catch (error) {
               if (error instanceof GameError) {
               return reply
              .code(GAME_ERROR_STATUS[error.code])
              .send({
              code: error.code,
              error: error.message,
             });
             }

  throw error;
}
        },
    );
}