import TugasItem from "./TugasItem";

export default function DivisiCard({ data, onChange, onHapus }) {
  const update = (patch) => onChange({ ...data, ...patch });

  const updateTugas = (i, t) => {
    const arr = [...data.tugas];
    arr[i] = t;
    update({ tugas: arr });
  };
  const hapusTugas = (i) =>
    update({ tugas: data.tugas.filter((_, x) => x !== i) });
  const tambahTugas = () =>
    update({
      tugas: [
        ...data.tugas,
        {
          deskripsi: "",
          teknisi: "",
          jam: "",
          selesai: false,
          jam_selesai: "",
        },
      ],
    });

  const jumlahTugas = data.tugas.length;
  const jumlahSelesai = data.tugas.filter((t) => t.selesai).length;

  return (
    <div style={s.card}>
      {/* ===== HEADER ===== */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.iconBox}>📍</div>
          <input
            placeholder="Nama divisi (mis. CCTV)"
            value={data.nama}
            onChange={(e) => update({ nama: e.target.value })}
            style={s.inputNama}
          />
        </div>

        <div style={s.headerRight}>
          {jumlahTugas > 0 && (
            <span style={s.badge}>
              {jumlahSelesai}/{jumlahTugas} ✅
            </span>
          )}
          <button onClick={onHapus} style={s.btnHapus} title="Hapus divisi">
            Hapus
          </button>
        </div>
      </div>

      {/* ===== LIST TUGAS ===== */}
      <div style={s.tugasList}>
        {data.tugas.length === 0 && (
          <div style={s.emptyTugas}>
            Belum ada tugas. Klik <b>+ Tambah Tugas</b> di bawah.
          </div>
        )}

        {data.tugas.map((t, i) => (
          <TugasItem
            key={i}
            data={t}
            onChange={(val) => updateTugas(i, val)}
            onHapus={() => hapusTugas(i)}
          />
        ))}
      </div>

      {/* ===== FOOTER ===== */}
      <button onClick={tambahTugas} style={s.btnTambah}>
        <span style={s.plusIcon}>+</span> Tambah Tugas
      </button>
    </div>
  );
}

const s = {
  card: {
    background: "#fff",
    border: "1px solid #eef0f3",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  header: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    flexWrap: "wrap",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: "1 1 200px",
    minWidth: 0,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
    border: "1px solid #dbeafe",
  },
  inputNama: {
    flex: 1,
    padding: "10px 12px",
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
    border: "1px solid #e5e7eb",
    borderRadius: 9,
    background: "#f9fafb",
    outline: "none",
    minWidth: 0,
    boxSizing: "border-box",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  badge: {
    background: "#ecfdf5",
    color: "#059669",
    padding: "5px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid #d1fae5",
    whiteSpace: "nowrap",
  },
  btnHapus: {
    padding: "8px 12px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fee2e2",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  /* ----- Tugas list ----- */
  tugasList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 12,
  },
  emptyTugas: {
    padding: "14px 16px",
    background: "#f9fafb",
    border: "1px dashed #d1d5db",
    borderRadius: 9,
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
  },

  /* ----- Tombol tambah ----- */
  btnTambah: {
    width: "100%",
    padding: "11px 16px",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    border: 0,
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    boxShadow: "0 2px 6px rgba(59,130,246,0.3)",
  },
  plusIcon: {
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 800,
  },
};
