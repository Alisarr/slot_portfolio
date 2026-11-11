import { buildApp } from "./app";
import { loadStoredSession } from "./sessionRepository";
import { pool } from "./db";


const app = buildApp(loadStoredSession, true);

app.addHook("onClose", async () => {
    await pool.end();
});

function shutdown(): void {
    void app.close().catch((error: unknown) => {
        app.log.error(error);
        process.exitCode = 1;
    });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

try {
    await app.listen({
        host: "127.0.0.1",
        port: 3000,
    });
} catch (error) {
    app.log.error(error);
    process.exitCode = 1;
    await app.close();
}