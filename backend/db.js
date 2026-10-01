const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST,
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASS,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

pool
  .query("SELECT 1")
  .then(() =>
    console.log(
      "✅ MySQL terhubung:",
      process.env.MYSQLDATABASE || process.env.DB_NAME,
    ),
  )
  .catch((e) => console.error("❌ MySQL gagal:", e.message));

module.exports = pool;
