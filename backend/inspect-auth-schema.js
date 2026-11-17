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
    const schema = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'umuhuza'
      ORDER BY ordinal_position
    `);

    const admin = await pool.query(`
      SELECT id, full_name, phone, role, is_active,
             farmer_id, umuhuza_id
      FROM users
      WHERE role = 'ADMIN'
    `);

    console.log("===== UMUHUZA TABLE REQUIREMENTS =====");
    console.table(schema.rows);

    console.log("===== ADMIN ACCOUNT =====");
    console.table(admin.rows);
  } catch (error) {
    console.log("ERROR:", error.message);
  } finally {
    await pool.end();
  }
})();
