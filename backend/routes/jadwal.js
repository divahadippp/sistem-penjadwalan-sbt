const express = require("express");
const router = express.Router();
const db = require("../db");
const { formatWA } = require("../utils/formatWA");

/* ============================================================
   TEMPLATE DEFAULT PER DIVISI
   ============================================================ */
const TEMPLATE_DIVISI = [
  {
    nama: "Adm",
    tugas: [
      { deskripsi: "Cek barang (stok op name)", teknisi: "Tita", jam: "08:00" },
      {
        deskripsi: "Kebersihan barang jangan sampai berdebu",
        teknisi: "Ismail",
        jam: "08:00",
      },
      { deskripsi: "Belajar kasir digital", teknisi: "Ismail", jam: "08:00" },
    ],
  },
  {
    nama: "Marketing",
    tugas: [
      { deskripsi: "Bikin konten", teknisi: "Diva", jam: "08:00" },
      {
        deskripsi:
          "Upload konten ke semua sosial media (Facebook, Instagram, TikTok, Facebook Meta)",
        teknisi: "Lia",
        jam: "08:00",
      },
      { deskripsi: "Live sosial media", teknisi: "Pita, Naya", jam: "08:00" },
    ],
  },
  {
    nama: "CCTV",
    tugas: [
      {
        deskripsi: "Cek kamera offline & pastikan semua online",
        teknisi: "",
        jam: "08:00",
      },
    ],
  },
  {
    nama: "Aminities",
    tugas: [{ deskripsi: "Antar pesanan aminities", teknisi: "", jam: "" }],
  },
];

/* ============================================================
   GET / → list riwayat + DETAIL DIVISI & TUGAS
   ============================================================ */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, tanggal, dibuat_pada, diupdate_pada
       FROM jadwal
       ORDER BY tanggal DESC
       LIMIT 200`,
    );

    for (const j of rows) {
      // Ambil divisi
      const [divisi] = await db.query(
        "SELECT * FROM divisi WHERE jadwal_id=? ORDER BY urutan, id",
        [j.id],
      );

      // Ambil tugas untuk setiap divisi
      for (const d of divisi) {
        const [tugas] = await db.query(
          "SELECT * FROM tugas WHERE divisi_id=? ORDER BY urutan, id",
          [d.id],
        );
        d.tugas = tugas;
      }

      j.divisi = divisi;

      // Statistik ringkas
      const totalDivisi = divisi.length;
      const totalTugas = divisi.reduce((a, d) => a + (d.tugas?.length || 0), 0);
      const totalSelesai = divisi.reduce(
        (a, d) => a + (d.tugas?.filter((t) => t.selesai).length || 0),
        0,
      );

      j.total_divisi = totalDivisi;
      j.total_tugas = totalTugas;
      j.total_selesai = totalSelesai;
    }

    res.json(rows);
  } catch (e) {
    console.error("❌ GET /jadwal:", e.message);
    res.status(500).json({ error: e.message });
  }
});

/* ============================================================
   GET /template → template default (TANPA simpan)
   ============================================================ */
router.get("/template", (_req, res) => {
  res.json(TEMPLATE_DIVISI);
});

/* ============================================================
   GET /:tanggal/preview
   ============================================================ */
router.get("/:tanggal/preview", async (req, res) => {
  const { tanggal } = req.params;
  try {
    const [[jadwal]] = await db.query("SELECT * FROM jadwal WHERE tanggal=?", [
      tanggal,
    ]);
    if (!jadwal) return res.json({ text: "" });

    const [divisi] = await db.query(
      "SELECT * FROM divisi WHERE jadwal_id=? ORDER BY urutan, id",
      [jadwal.id],
    );
    for (const d of divisi) {
      const [tugas] = await db.query(
        "SELECT * FROM tugas WHERE divisi_id=? ORDER BY urutan, id",
        [d.id],
      );
      d.tugas = tugas;
    }
    const [kehadiran] = await db.query(
      `SELECT k.nama, h.status
       FROM kehadiran h
       JOIN karyawan k ON k.id = h.karyawan_id
       WHERE h.jadwal_id = ?`,
      [jadwal.id],
    );

    res.json({ text: formatWA(jadwal, divisi, kehadiran) });
  } catch (e) {
    console.error("❌ GET /jadwal/:tgl/preview:", e.message);
    res.status(500).json({ error: e.message });
  }
});

/* ============================================================
   GET /:tanggal → HANYA BACA. TIDAK AUTO-INSERT.
   ============================================================ */
router.get("/:tanggal", async (req, res) => {
  const { tanggal } = req.params;
  try {
    const [[jadwal]] = await db.query("SELECT * FROM jadwal WHERE tanggal=?", [
      tanggal,
    ]);

    // ===== KALAU BELUM ADA → kembalikan template (TIDAK simpan) =====
    if (!jadwal) {
      const templateDivisi = TEMPLATE_DIVISI.map((d) => ({
        nama: d.nama,
        tugas: d.tugas.map((t) => ({
          deskripsi: t.deskripsi,
          teknisi: t.teknisi || "",
          jam: t.jam || "",
          selesai: false,
          jam_selesai: "",
        })),
      }));

      const [karyawan] = await db.query(
        "SELECT id AS karyawan_id, nama FROM karyawan ORDER BY nama",
      );
      const kehadiran = karyawan.map((k) => ({
        karyawan_id: k.karyawan_id,
        nama: k.nama,
        status: "berangkat",
      }));

      return res.json({
        jadwal: { tanggal },
        divisi: templateDivisi,
        kehadiran,
        isBaru: true,
      });
    }

    // ===== KALAU SUDAH ADA → ambil dari DB =====
    const [divisi] = await db.query(
      "SELECT * FROM divisi WHERE jadwal_id=? ORDER BY urutan, id",
      [jadwal.id],
    );
    for (const d of divisi) {
      const [tugas] = await db.query(
        "SELECT * FROM tugas WHERE divisi_id=? ORDER BY urutan, id",
        [d.id],
      );
      d.tugas = tugas;
    }

    const [kehadiran] = await db.query(
      `SELECT k.id AS karyawan_id, k.nama, h.status
       FROM kehadiran h
       JOIN karyawan k ON k.id = h.karyawan_id
       WHERE h.jadwal_id = ?`,
      [jadwal.id],
    );

    res.json({ jadwal, divisi, kehadiran, isBaru: false });
  } catch (e) {
    console.error("❌ GET /jadwal/:tgl:", e.message);
    res.status(500).json({ error: e.message });
  }
});

/* ============================================================
   POST /:tanggal → BARU DI SINI data disimpan
   ============================================================ */
router.post("/:tanggal", async (req, res) => {
  const { tanggal } = req.params;
  const { divisi = [], kehadiran = [] } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let [[jadwal]] = await conn.query("SELECT * FROM jadwal WHERE tanggal=?", [
      tanggal,
    ]);
    if (!jadwal) {
      const [r] = await conn.query("INSERT INTO jadwal (tanggal) VALUES (?)", [
        tanggal,
      ]);
      jadwal = { id: r.insertId };
    }

    await conn.query("DELETE FROM divisi WHERE jadwal_id=?", [jadwal.id]);
    await conn.query("DELETE FROM kehadiran WHERE jadwal_id=?", [jadwal.id]);

    for (let i = 0; i < divisi.length; i++) {
      const d = divisi[i];
      if (!d.nama || !d.nama.trim()) continue;

      const [rd] = await conn.query(
        "INSERT INTO divisi (jadwal_id, nama, urutan) VALUES (?, ?, ?)",
        [jadwal.id, d.nama.trim(), i],
      );

      for (let j = 0; j < (d.tugas || []).length; j++) {
        const t = d.tugas[j];
        if (!t.deskripsi || !t.deskripsi.trim()) continue;

        await conn.query(
          `INSERT INTO tugas
             (divisi_id, deskripsi, teknisi, jam, selesai, jam_selesai, urutan)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            rd.insertId,
            t.deskripsi.trim(),
            t.teknisi?.trim() || null,
            t.jam?.trim() || null,
            t.selesai ? 1 : 0,
            t.jam_selesai || null,
            j,
          ],
        );
      }
    }

    for (const k of kehadiran) {
      if (!k.karyawan_id) continue;
      await conn.query(
        "INSERT INTO kehadiran (jadwal_id, karyawan_id, status) VALUES (?, ?, ?)",
        [jadwal.id, k.karyawan_id, k.status],
      );
    }

    await conn.commit();
    console.log(`✅ Jadwal ${tanggal} tersimpan (id=${jadwal.id})`);
    res.json({ ok: true, jadwal_id: jadwal.id });
  } catch (e) {
    await conn.rollback();
    console.error("❌ POST /jadwal/:tgl:", e.message);
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

/* ============================================================
   DELETE /:tanggal
   ============================================================ */
router.delete("/:tanggal", async (req, res) => {
  try {
    await db.query("DELETE FROM jadwal WHERE tanggal=?", [req.params.tanggal]);
    res.json({ ok: true });
  } catch (e) {
    console.error("❌ DELETE /jadwal/:tgl:", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
