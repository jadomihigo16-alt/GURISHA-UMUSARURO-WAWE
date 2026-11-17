require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});

async function inspect() {
  try {
    const result = await pool.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('products', 'orders')
      ORDER BY table_name, ordinal_position
    `);

    console.table(result.rows);

    const products = await pool.query(`
      SELECT * FROM products ORDER BY id DESC LIMIT 2
    `);

    console.log("PRODUCTS SAMPLE:");
    console.log(products.rows);

    const orders = await pool.query(`
      SELECT * FROM orders ORDER BY id DESC LIMIT 2
    `);

    console.log("ORDERS SAMPLE:");
    console.log(orders.rows);
  } catch (error) {
    console.error("DATABASE ERROR:", error.message);
  } finally {
    await pool.end();
  }
}

inspect();
