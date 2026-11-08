import { Pool } from "pg";

const pool = new Pool({
  connectionTimeoutMillis: 5000,
});

try {
  const result = await pool.query(`
    SELECT
      current_database() AS database,
      current_user AS username;
  `);

  console.table(result.rows);
} catch (error) {
  const message =
    error instanceof Error ? error.message : String(error);

  console.error("Database connection failed:", message);
  process.exitCode = 1;
} finally {
  await pool.end();
}