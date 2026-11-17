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
    const linked = await pool.query(`
      SELECT f.id, f.farmer_name, f.phone,
             COUNT(p.id) AS products_count
      FROM farmers f
      LEFT JOIN products p ON p.farmer_id = f.id
      GROUP BY f.id, f.farmer_name, f.phone
      HAVING COUNT(p.id) > 0
      ORDER BY products_count DESC, f.id
    `);

    const constraints = await pool.query(`
      SELECT conname, contype,
             pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE conrelid = 'umuhuza'::regclass
      ORDER BY conname
    `);

    const users = await pool.query(`
      SELECT role, COUNT(*) AS total
      FROM users
      GROUP BY role
      ORDER BY role
    `);

    console.log("===== ABahinzi BAFITE UMUSARURO =====");
    console.table(linked.rows);

    console.log("===== UMUHUZA CONSTRAINTS =====");
    console.table(constraints.rows);

    console.log("===== USERS BY ROLE =====");
    console.table(users.rows);
  } catch (error) {
    console.log("ERROR:", error.message);
  } finally {
    await pool.end();
  }
})();
