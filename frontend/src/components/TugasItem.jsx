import { useEffect, useState } from "react";

/* ============================================================
   Hook: deteksi mobile via inline
   ============================================================ */
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

export default function TugasItem({ data, onChange, onHapus }) {
  const isMobile = useIsMobile(640);
  const update = (patch) => onChange({ ...data, ...patch });

  const toggleSelesai = (checked) => {
    if (checked) {
      const now = new Date();
      const jam = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      });
      update({ selesai: true, jam_selesai: data.jam_selesai || jam });
    } else {
      update({ selesai: false, jam_selesai: "" });
    }
  };

  return (
    <div style={{ ...s.row, ...(data.selesai ? s.rowDone : {}) }}>
      {/* ===== Baris 1: Deskripsi ===== */}
      <textarea
        placeholder="Deskripsi tugas (mis. pemasangan 3 camera jaify di kapringan)"
        value={data.deskripsi}
        onChange={(e) => update({ deskripsi: e.target.value })}
        style={s.textarea}
        rows={2}
      />

      {/* ===== Baris 2: Teknisi & Jam ===== */}
      <div style={{ ...s.subRow, ...(isMobile ? s.subRowMobile : {}) }}>
        <input
          placeholder="Teknisi (mis. Tita)"
          value={data.teknisi || ""}
          onChange={(e) => update({ teknisi: e.target.value })}
          style={s.input}
        />
        <input
          placeholder="Jam mulai (08:00)"
          value={data.jam || ""}
          onChange={(e) => update({ jam: e.target.value })}
          style={{ ...s.input, maxWidth: isMobile ? "100%" : 120 }}
        />
      </div>

      {/* ===== Baris 3: Selesai + Jam Selesai + Hapus ===== */}
      <div style={{ ...s.subRow, ...(isMobile ? s.subRowMobile : {}) }}>
        <label style={s.checkLabel}>
          <input
            type="checkbox"
            checked={!!data.selesai}
            onChange={(e) => toggleSelesai(e.target.checked)}
          />
          <span style={s.checkText}>Selesai ✅</span>
        </label>

        {data.selesai && (
          <div style={s.jamSelesaiBox}>
            <span style={s.jamSelesaiLabel}>Jam selesai:</span>
            <input
              placeholder="16:30"
              value={data.jam_selesai || ""}
              onChange={(e) => update({ jam_selesai: e.target.value })}
              style={s.inputJamSelesai}
            />
          </div>
        )}

        <button onClick={onHapus} style={s.btnHapus} title="Hapus tugas">
          ✖
        </button>
      </div>
    </div>
  );
}

const s = {
  row: {
    background: "#f9fafb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    border: "1px solid #f3f4f6",
    transition: "background 0.2s ease, border-color 0.2s ease",
  },
  rowDone: {
    background: "#ecfdf5",
    borderColor: "#d1fae5",
  },
  textarea: {
    width: "100%",
    padding: 8,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
    background: "#fff",
  },
  subRow: {
    display: "flex",
    gap: 8,
    marginTop: 6,
    alignItems: "center",
    flexWrap: "wrap",
  },
  subRowMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  input: {
    flex: 1,
    padding: 6,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    minWidth: 100,
    fontSize: 13,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    cursor: "pointer",
    userSelect: "none",
    padding: "6px 10px",
    background: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: 6,
  },
  checkText: {
    fontWeight: 600,
    color: "#374151",
  },
  jamSelesaiBox: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 8px",
    background: "#d1fae5",
    borderRadius: 6,
    border: "1px solid #a7f3d0",
  },
  jamSelesaiLabel: {
    fontSize: 12,
    color: "#065f46",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  inputJamSelesai: {
    width: 70,
    padding: 4,
    borderRadius: 5,
    border: "1px solid #a7f3d0",
    fontSize: 13,
    background: "#fff",
    outline: "none",
    textAlign: "center",
    fontWeight: 600,
    color: "#065f46",
  },
  btnHapus: {
    padding: "6px 10px",
    background: "#ef4444",
    color: "#fff",
    border: 0,
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  },
};
