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
    const r = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'farmers'
      ORDER BY ordinal_position
    `);
    console.table(r.rows);
  } catch (e) {
    console.log(e.message);
  } finally {
    await pool.end();
  }
})();
