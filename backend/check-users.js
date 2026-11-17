require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432)
});

(async () => {
  try {
    const result = await pool.query(
      "SELECT role, COUNT(*)::int AS total FROM users GROUP BY role ORDER BY role"
    );
    console.table(result.rows);
  } catch (error) {
    console.log("ERROR:", error.message);
  } finally {
    await pool.end();
  }
})();
