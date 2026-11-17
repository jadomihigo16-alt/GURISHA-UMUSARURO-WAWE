require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const readline = require("readline-sync");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
  ssl: process.env.DB_SSL === "true"
    ? { rejectUnauthorized: false }
    : undefined
});

(async () => {
  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1"
    );

    if (existing.rows.length) {
      console.log("ADMIN ASANZWEHO. NTA YINDI KONTI YONGEWE.");
      return;
    }

    const name = "MIHIGO JEAN DE DIEU";
    const phone = readline.question("Andika telefoni ya ADMIN: ").trim();
    const password = readline.question(
      "Andika password ya ADMIN: ",
      { hideEchoBack: true }
    );

    if (!phone || password.length < 8) {
      throw new Error("Telefoni irakenewe; password igomba nibura inyuguti 8.");
    }

    const hash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO users (full_name, phone, password_hash, role)
       VALUES ($1, $2, $3, 'ADMIN')`,
      [name, phone, hash]
    );

    console.log("\nKONTI YA ADMIN YAKOZWE NEZA!");
    console.log("AMAZINA: " + name);
    console.log("TELEFONI: " + phone);
    console.log("ROLE: ADMIN");
  } catch (error) {
    console.error("ERROR:", error.code === "23505"
      ? "Telefoni isanzwe ikoreshwa."
      : error.message);
  } finally {
    await pool.end();
  }
})();
