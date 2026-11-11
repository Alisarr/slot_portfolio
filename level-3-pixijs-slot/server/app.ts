import fastify from "fastify";
import { z } from "zod";
import type { loadStoredSession } from "./sessionRepository";
import { toPublicGameSession } from "./toPublicGameSession";


const sessionIdSchema = z.uuid();

export function buildApp(
    loadSession: typeof loadStoredSession,
    logger = false,
) {
    const app = fastify({logger});

    app.setErrorHandler((error, request, reply) => {
        request.log.error(error);

        return reply.code(500).send({
            error: "Internal server error",
        });
    });

    app.get <{ Params: {id: string } }> (
        "/sessions/:id",
        async (request, reply) => {
            reply.header("Cache-Control", "no-store");

            const parsedId = sessionIdSchema.safeParse(request.params.id);

            if (!parsedId.success){
                return reply.code(400).send({
                    error: "Invalid session ID",
                });
            }

            const stored = await loadSession(parsedId.data);

            if ( stored === null) {
                return reply.code(404).send({
                    error: "Game session not found",
                });
            }

            return {
                id: stored.id,
                session: toPublicGameSession(stored.state),
            };
        },
    );

    return app;
}
