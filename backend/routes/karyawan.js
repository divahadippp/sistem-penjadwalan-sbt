const express = require("express");
const router = express.Router();
const db = require("../db");

// GET semua karyawan
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM karyawan ORDER BY nama");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST tambah karyawan
router.post("/", async (req, res) => {
  const { nama, divisi } = req.body;
  if (!nama) return res.status(400).json({ error: "nama wajib diisi" });
  try {
    const [r] = await db.query(
      "INSERT INTO karyawan (nama, divisi) VALUES (?, ?)",
      [nama, divisi || null],
    );
    res.json({ id: r.insertId, nama, divisi });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE karyawan
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM karyawan WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
