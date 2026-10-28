const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "gurisha_umusaruro_db",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL: gurisha_umusaruro_db CONNECTED");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL ERROR:", err.message);
});

module.exports = pool;