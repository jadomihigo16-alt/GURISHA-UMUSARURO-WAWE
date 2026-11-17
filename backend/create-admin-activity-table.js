require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});

async function main() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
        id BIGSERIAL PRIMARY KEY,
        admin_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        details JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_admin_activity_logs_target_user
      ON admin_activity_logs(target_user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_admin_activity_logs_created_at
      ON admin_activity_logs(created_at DESC)
    `);

    console.log("ADMIN ACTIVITY TABLE YAREMWE NEZA.");
  } catch (error) {
    console.error("KUREMA ACTIVITY TABLE BYANZE:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();