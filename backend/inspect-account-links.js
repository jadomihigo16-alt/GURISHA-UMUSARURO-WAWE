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
    const farmers = await pool.query(`
      SELECT COUNT(*) AS total_farmers,
             COUNT(DISTINCT phone) AS distinct_phones
      FROM farmers
    `);

    const duplicates = await pool.query(`
      SELECT phone, COUNT(*) AS records
      FROM farmers
      GROUP BY phone
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `);

    const umuhuza = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'umuhuza'
      ORDER BY ordinal_position
    `);

    console.log("===== FARMERS SUMMARY =====");
    console.table(farmers.rows);

    console.log("===== DUPLICATE FARMER PHONES =====");
    console.table(duplicates.rows);

    console.log("===== UMUHUZA TABLE =====");
    console.table(umuhuza.rows);
  } catch (error) {
    console.log("ERROR:", error.message);
  } finally {
    await pool.end();
  }
})();
