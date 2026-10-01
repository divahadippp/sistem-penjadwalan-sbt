const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

pool
  .query("SELECT 1")
  .then(() => console.log("✅ MySQL terhubung:", process.env.DB_NAME))
  .catch((e) => console.error("❌ MySQL gagal:", e.message));

module.exports = pool;
