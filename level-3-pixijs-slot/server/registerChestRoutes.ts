import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { chooseStoredChest } from "./chooseStoredChest"
import { toPublicGameSession } from "./toPublicGameSession";


const sessionIdSchema = z.uuid();

const chestBodySchema = z.strictObject ({
    requestId: z.uuid(),
    chestIndex: z.number().int().min(0).max(4),
});

const chestErrorStatuses = new Map<string, number>([
    ["Game session not found", 404],
    ["No active bonus", 409],
    ["No chest reward is pending", 409],
    ["Request ID was already used with a different chest", 409],
]);

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
                if (error instanceof Error) {
                    const status = chestErrorStatuses.get(error.message);

                    if (status !== undefined) {
                        return reply.code(status).send({
                            error: error.message,
                        });
                    }
                }

                throw error;
            }
        },
    );
}