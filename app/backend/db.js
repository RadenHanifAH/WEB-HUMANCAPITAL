import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",          // ubah jika pakai user lain
  password: "",          // isi password MySQL kamu
  database: "web_hc",    // ubah sesuai nama database kamu
});

db.connect((err) => {
  if (err) {
    console.error("❌ Koneksi ke database gagal:", err);
  } else {
    console.log("✅ Terhubung ke MySQL Database!");
  }
});

export default db;
