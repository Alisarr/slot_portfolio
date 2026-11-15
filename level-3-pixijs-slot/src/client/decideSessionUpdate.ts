export interface SessionVersion {
    readonly sessionId: string;
    readonly version: number | null; 
}

export type SessionUpdateDecision = "apply" | "ignore" | "refresh";


export function decideSessionUpdate(
    current: SessionVersion,
    incoming: SessionVersion,
): SessionUpdateDecision {
   if(incoming.sessionId !== current.sessionId) {
    return "ignore";
   }

   if (incoming.version === null) {
    return "refresh";
   }
   if (current.version === null || incoming.version > current.version) {
    return "apply";
   }
   return "ignore";
}