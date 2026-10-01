import { useEffect, useState } from "react";
import {
  getJadwal,
  saveJadwal,
  getPreview,
  getKaryawan,
  getTemplate,
} from "../api";
import DivisiCard from "../components/DivisiCard";
import PreviewWA from "../components/PreviewWA";

export default function FormJadwal({ tanggal, setTanggal }) {
  const [divisi, setDivisi] = useState([]);
  const [kehadiran, setKehadiran] = useState([]);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBaru, setIsBaru] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const load = async (tgl) => {
    setLoading(true);
    try {
      const [j, k] = await Promise.all([getJadwal(tgl), getKaryawan()]);

      const divisiBersih = j.divisi.map((d) => ({
        nama: d.nama,
        tugas: (d.tugas || []).map((t) => ({
          deskripsi: t.deskripsi,
          teknisi: t.teknisi || "",
          jam: t.jam || "",
          selesai: !!t.selesai,
          jam_selesai: t.jam_selesai || "",
        })),
      }));

      setDivisi(divisiBersih);
      setIsBaru(!!j.isBaru);

      const map = {};
      k.forEach((x) => (map[x.id] = "berangkat"));
      j.kehadiran.forEach((x) => (map[x.karyawan_id] = x.status));

      setKehadiran(
        k.map((x) => ({
          karyawan_id: x.id,
          nama: x.nama,
          status: map[x.id] || "berangkat",
        })),
      );

      const p = await getPreview(tgl);
      setPreview(p.text);
      setIsDirty(false);
    } catch (e) {
      console.error(e);
      alert("Gagal memuat: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tanggal) load(tanggal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanggal]);

  useEffect(() => {
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleGantiTanggal = (tglBaru) => {
    if (tglBaru === tanggal) return;
    if (isDirty) {
      const ok = window.confirm(
        `⚠️ Ada perubahan pada tanggal ${tanggal} yang belum disimpan.\n\n` +
          `Klik OK untuk PINDAH TANGGAL (perubahan akan HILANG).\n` +
          `Klik Cancel untuk tetap di sini dan simpan dulu.`,
      );
      if (!ok) return;
    }
    setTanggal(tglBaru);
  };

  const simpan = async () => {
    try {
      await saveJadwal(tanggal, { divisi, kehadiran });
      const p = await getPreview(tanggal);
      setPreview(p.text);
      setIsDirty(false);
      setIsBaru(false);
      alert("✅ Jadwal tersimpan");
    } catch (e) {
      console.error(e);
      alert("Gagal simpan: " + e.message);
    }
  };

  const refreshPreview = async () => {
    const p = await getPreview(tanggal);
    setPreview(p.text);
  };

  const muatTemplate = async () => {
    if (
      !confirm(
        "Muat template default? Data divisi saat ini akan DIGANTI (belum tersimpan ke database sampai Anda klik Simpan).",
      )
    )
      return;
    try {
      const tmpl = await getTemplate();
      const divisiBaru = tmpl.map((d) => ({
        nama: d.nama,
        tugas: d.tugas.map((t) => ({
          deskripsi: t.deskripsi,
          teknisi: t.teknisi || "",
          jam: t.jam || "",
          selesai: false,
          jam_selesai: "",
        })),
      }));
      setDivisi(divisiBaru);
      setIsDirty(true);
    } catch (e) {
      alert("Gagal muat template: " + e.message);
    }
  };

  const updateDivisi = (i, d) => {
    const arr = [...divisi];
    arr[i] = d;
    setDivisi(arr);
    setIsDirty(true);
  };
  const hapusDivisi = (i) => {
    setDivisi(divisi.filter((_, x) => x !== i));
    setIsDirty(true);
  };
  const tambahDivisi = () => {
    setDivisi([...divisi, { nama: "", tugas: [] }]);
    setIsDirty(true);
  };

  const ubahStatus = (id, status) => {
    setKehadiran(
      kehadiran.map((k) => (k.karyawan_id === id ? { ...k, status } : k)),
    );
    setIsDirty(true);
  };

  return (
    <div style={s.wrapper}>
      <div style={s.toolbar}>
        <div style={s.toolbarGroup}>
          <label style={s.label}>📅 Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => handleGantiTanggal(e.target.value)}
            style={s.inputDate}
          />
          {isDirty && <span style={s.dirtyBadge}>● Belum disimpan</span>}
        </div>

        <div style={s.toolbarActions}>
          <button onClick={muatTemplate} style={s.btnTemplate}>
            📋 Template
          </button>
          <button
            onClick={simpan}
            style={{
              ...s.btnPrimary,
              ...(isDirty ? s.btnPrimaryActive : s.btnPrimaryDisabled),
            }}
            disabled={!isDirty}
            title={isDirty ? "Klik untuk simpan" : "Tidak ada perubahan"}
          >
            💾 Simpan
          </button>
          <button onClick={refreshPreview} style={s.btnSecondary}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {isBaru && !isDirty && (
        <div style={s.infoBanner}>
          ✨ <b>Template siap untuk {tanggal}</b> — edit lalu klik <b>Simpan</b>{" "}
          untuk menyimpan.
        </div>
      )}

      {isDirty && (
        <div style={s.warnBanner}>
          ⚠️ <b>Perubahan belum disimpan!</b> Klik <b>💾 Simpan</b> sebelum
          pindah tanggal.
        </div>
      )}

      {loading ? (
        <div style={s.loadingBox}>
          <div style={s.spinner}></div>
          <p style={{ color: "#6b7280", marginTop: 12 }}>Memuat data...</p>
        </div>
      ) : (
        <>
          <div style={s.divisiList}>
            {divisi.map((d, i) => (
              <DivisiCard
                key={i}
                data={d}
                onChange={(val) => updateDivisi(i, val)}
                onHapus={() => hapusDivisi(i)}
              />
            ))}
          </div>

          <button onClick={tambahDivisi} style={s.btnAdd}>
            + Tambah Divisi
          </button>

          <div style={s.sectionHead}>
            <h2 style={s.h2}>👥 Kehadiran Karyawan</h2>
            <span style={s.badge}>{kehadiran.length} orang</span>
          </div>

          <div style={s.gridKehadiran}>
            {kehadiran.map((k) => {
              const color =
                k.status === "berangkat"
                  ? "#10b981"
                  : k.status === "telat"
                    ? "#f59e0b"
                    : "#6b7280";
              return (
                <div key={k.karyawan_id} style={s.karyawanCard}>
                  <div style={s.karyawanLeft}>
                    <div style={{ ...s.dot, background: color }}></div>
                    <span style={s.karyawanNama}>{k.nama}</span>
                  </div>
                  <select
                    value={k.status}
                    onChange={(e) => ubahStatus(k.karyawan_id, e.target.value)}
                    style={s.select}
                  >
                    <option value="berangkat">Berangkat</option>
                    <option value="telat">Belum berangkat</option>
                    <option value="libur">Libur</option>
                  </select>
                </div>
              );
            })}
          </div>

          <PreviewWA text={preview} />
        </>
      )}
    </div>
  );
}

const s = {
  wrapper: { width: "100%" },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    background: "#fff",
    padding: 14,
    borderRadius: 14,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #eef0f3",
    flexWrap: "wrap",
  },
  toolbarGroup: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: "1 1 200px",
    flexWrap: "wrap",
  },
  label: { fontWeight: 600, fontSize: 14, color: "#374151" },
  inputDate: {
    padding: "9px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    background: "#f9fafb",
    outline: "none",
    flex: 1,
    minWidth: 0,
    maxWidth: 220,
  },
  dirtyBadge: {
    background: "#fef3c7",
    color: "#92400e",
    fontSize: 11.5,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 20,
    border: "1px solid #fde68a",
    whiteSpace: "nowrap",
  },
  toolbarActions: { display: "flex", gap: 8, flexWrap: "wrap" },
  btnPrimary: {
    padding: "10px 18px",
    color: "#fff",
    border: 0,
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  btnPrimaryActive: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    boxShadow: "0 2px 6px rgba(37,99,235,0.35)",
  },
  btnPrimaryDisabled: {
    background: "#cbd5e1",
    cursor: "not-allowed",
  },
  btnSecondary: {
    padding: "10px 18px",
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  btnTemplate: {
    padding: "10px 18px",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    border: 0,
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    boxShadow: "0 2px 6px rgba(139,92,246,0.35)",
  },
  infoBanner: {
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    color: "#1e40af",
    padding: "12px 16px",
    borderRadius: 10,
    fontSize: 13.5,
    marginBottom: 16,
  },
  warnBanner: {
    background: "#fef3c7",
    border: "1px solid #fde68a",
    color: "#92400e",
    padding: "12px 16px",
    borderRadius: 10,
    fontSize: 13.5,
    marginBottom: 16,
  },
  divisiList: { display: "grid", gridTemplateColumns: "1fr", gap: 14 },
  btnAdd: {
    width: "100%",
    padding: "13px 20px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    border: 0,
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
    boxShadow: "0 2px 8px rgba(16,185,129,0.32)",
    marginTop: 4,
  },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 8,
  },
  h2: { margin: 0, fontSize: 18, color: "#111827", fontWeight: 700 },
  badge: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },
  gridKehadiran: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 10,
  },
  karyawanCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #eef0f3",
  },
  karyawanLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  dot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  karyawanNama: {
    fontSize: 14,
    fontWeight: 500,
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  select: {
    padding: "6px 8px",
    borderRadius: 7,
    border: "1px solid #d1d5db",
    fontSize: 12,
    background: "#f9fafb",
    cursor: "pointer",
    outline: "none",
    flexShrink: 0,
  },
  loadingBox: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #eef0f3",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    margin: "0 auto",
    animation: "spin 0.9s linear infinite",
  },
};
