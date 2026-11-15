import { getSessionResponseSchema } from "./sessionSchemas";
import type { PublicGameSession } from "./sessionSchemas";
import type { SessionStore } from "./SessionStore"; 
import type { SessionUpdateDecision } from "./decideSessionUpdate";

export async function refreshSession(
    store: SessionStore<PublicGameSession>,
    baseUrl: string,
    fetcher: typeof fetch = fetch,
): Promise<SessionUpdateDecision> {
    const sessionId = store.getState().sessionId;
    const url = `${baseUrl.replace(/\/+$/, "")}/sessions/${encodeURIComponent(sessionId)}`;

    const response = await fetcher(url, {
        method: "GET",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Failed to load session (HTTP ${response.status})`);
    }

    const body: unknown = await response.json();
    const parsed = getSessionResponseSchema.parse(body);

    if(parsed.id !== sessionId){
        throw new Error("Session response ID mismatch");
    }

    return store.receive({
        sessionId: parsed.id,
        version: parsed.version,
        session: parsed.session,
    });
}