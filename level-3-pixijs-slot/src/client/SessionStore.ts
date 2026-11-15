
import { decideSessionUpdate } from "./decideSessionUpdate";
import type {
    SessionUpdateDecision,
    SessionVersion,
} from "./decideSessionUpdate";

export interface SessionResponse<TSession> extends SessionVersion {
    readonly session: TSession;
}

export interface ClientSessionState<TSession> extends SessionVersion {
    readonly session: TSession | null;
}

export class SessionStore<TSession> {
    private state: ClientSessionState<TSession>;

    constructor(sessionId: string) {
        this.state = {
            sessionId,
            version: null,
            session: null,
        };
    }

    getState(): ClientSessionState<TSession> {
        return structuredClone(this.state);
    }

    receive(incoming: SessionResponse<TSession>): SessionUpdateDecision {
       const decision = decideSessionUpdate(this.state, incoming);

       if (decision === "apply") {
        this.state = structuredClone({
            sessionId: incoming.sessionId,
            version: incoming.version,
            session: incoming.session,
        });
       }

       return decision;
    }
}