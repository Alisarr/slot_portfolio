import Fastify from "fastify";
import { z } from "zod";
import { createGameSession } from "../src/game/GameSession.ts";
import type {
  createStoredSession,
  loadStoredSession,
} from "./sessionRepository.ts";
import { toPublicGameSession } from "./toPublicGameSession.ts";
import type { spinStoredSession } from "./spinStoredSession.ts";
import { registerSpinRoutes } from "./registerSpinRoutes.ts";

const sessionIdSchema = z.uuid();
const createSessionBodySchema = z.strictObject({}).optional();

const DEMO_INITIAL_BALANCE = 100;

interface AppDependencies {
  readonly loadSession: typeof loadStoredSession;
  readonly createSession: typeof createStoredSession;
  readonly spinSession: typeof spinStoredSession;
}

export function buildApp(
  dependencies: AppDependencies,
  logger = false,
) {
  const { loadSession, createSession, spinSession } = dependencies;

  const app = Fastify({ logger });

  app.setErrorHandler((error, request, reply) => {
    if (
      error instanceof Error &&
      "statusCode" in error &&
      typeof error.statusCode === "number" &&
      error.statusCode >= 400 &&
      error.statusCode < 500
    ) {
      return reply.code(error.statusCode).send({
        error: "Invalid request",
      });
    }

    request.log.error(error);

    return reply.code(500).send({
      error: "Internal server error",
    });
  });

  app.post("/sessions", async (request, reply) => {
    reply.header("Cache-Control", "no-store");

    const parsedBody = createSessionBodySchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({
        error: "Session creation accepts no fields",
      });
    }

    const session = createGameSession(DEMO_INITIAL_BALANCE);
    const id = await createSession(session);

    return reply
      .code(201)
      .header("Location", `/sessions/${id}`)
      .send({
        id,
        session: toPublicGameSession(session),
      });
  });

  app.get<{ Params: { id: string } }>(
    "/sessions/:id",
    async (request, reply) => {
      reply.header("Cache-Control", "no-store");

      const parsedId = sessionIdSchema.safeParse(request.params.id);

      if (!parsedId.success) {
        return reply.code(400).send({
          error: "Invalid session ID",
        });
      }

      const stored = await loadSession(parsedId.data);

      if (stored === null) {
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

  registerSpinRoutes(app, spinSession);

  return app;
}