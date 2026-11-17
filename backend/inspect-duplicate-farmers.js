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
    const duplicates = await pool.query(`
      SELECT id, farmer_name, phone
      FROM farmers
      WHERE phone IN (
        SELECT phone
        FROM farmers
        GROUP BY phone
        HAVING COUNT(*) > 1
      )
      ORDER BY phone, id
    `);

    const umuhuza = await pool.query(`
      SELECT COUNT(*) AS total_umuhuza
      FROM umuhuza
    `);

    console.log("===== ABahinzi BASANGIYE TELEFONI =====");
    console.table(duplicates.rows);

    console.log("===== UMUHUZA RECORDS =====");
    console.table(umuhuza.rows);
  } catch (error) {
    console.log("ERROR:", error.message);
  } finally {
    await pool.end();
  }
})();
