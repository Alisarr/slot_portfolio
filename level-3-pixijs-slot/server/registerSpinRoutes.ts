import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { spinStoredSession } from "./spinStoredSession";
import { toPublicGameSession } from "./toPublicGameSession";


const sessionIdSchema = z.uuid();

const spinBodySchema = z.strictObject({
    requestId: z.uuid(),
    totalBet: z.number().finite().positive(),
});

const spinErrorStatuses = new Map<string, number> ([
    ["Game session not found", 404],
    ["Insufficient balance", 409],
    ["Choose a chest before starting free spins", 409],
    ["Request ID was already used with a different bet", 409],
]);

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
                    mode: result.mode,
                    board: result.board,
                    boardBeforeExpansion: result.boardBeforeExpansion,
                    spin: result.spin,
                    session: toPublicGameSession(result.session),
                };
            } catch (error) {
                if (error instanceof Error) {
                    const status = spinErrorStatuses.get(error.message);

                    if (status !== undefined) {
                        return reply.code(status).send({
                            error: error.message,
                        });
                    }
                }

                throw error
            }
        },
    );
}