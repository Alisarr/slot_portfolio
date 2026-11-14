import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { spinStoredSession } from "./spinStoredSession";
import { toPublicGameSession } from "./toPublicGameSession";
import { GameError } from "../src/shared/GameError.ts";
import { GAME_ERROR_STATUS } from "./gameErrorStatus.ts";


const sessionIdSchema = z.uuid();

const spinBodySchema = z.strictObject({
    requestId: z.uuid(),
    totalBet: z.number().finite().positive(),
});



export function registerSpinRoutes(
    app: FastifyInstance,
    spinSession: typeof spinStoredSession,
): void {
    app.post<{Params: {id: string} }>(
        "/sessions/:id/spins",
        async (request, reply) => {
            reply.header("Cache-Control", "no-store");

            const parsedId = sessionIdSchema.safeParse(request.params.id);
            const parsedBody = spinBodySchema.safeParse(request.body);

            if (!parsedId.success || !parsedBody.success) {
                return reply.code(400).send({
                    error: "Invalid spin request",
                });
            }

            const { requestId, totalBet} = parsedBody.data;

            try {
                const result = await spinSession(
                    parsedId.data,
                    requestId,
                    totalBet,
                );

                return {
                    requestId,
                    version: result.version,
                    mode: result.mode,
                    board: result.board,
                    boardBeforeExpansion: result.boardBeforeExpansion,
                    spin: result.spin,
                    session: toPublicGameSession(result.session),
                };
            } catch (error) {
                if (error instanceof GameError) {    
                    return reply
                     .code(GAME_ERROR_STATUS[error.code])
                     .send({
                        code:error.code,
                        error: error.message,
                        });
                
                }

                throw error;
            }
        },
    );
}