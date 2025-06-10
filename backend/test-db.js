// server/test-db.js
const db = require("./db");

async function test() {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    console.log("✅ Koneksi OK:", rows[0].result);
    process.exit(0);
  } catch (err) {
    console.error("❌ Koneksi Gagal:", err.message);
    process.exit(1);
  }
}

test();
