import { useState } from "react";
import FormJadwal from "./pages/FormJadwal";
import Riwayat from "./pages/Riwayat";

export default function App() {
  const [page, setPage] = useState("form");
  const [tanggalAktif, setTanggalAktif] = useState(
    new Date().toISOString().slice(0, 10),
  );

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.brand}>
          <div style={s.logo}>📋</div>
          <div>
            <h1 style={s.title}>Sistem Penjadwalan SBT</h1>
            <p style={s.subtitle}>PT Sugih Bersama Grup</p>
          </div>
        </div>

        <nav style={s.nav}>
          <button
            onClick={() => setPage("form")}
            style={page === "form" ? s.navActive : s.navBtn}
          >
            📝 Form
          </button>
          <button
            onClick={() => setPage("riwayat")}
            style={page === "riwayat" ? s.navActive : s.navBtn}
          >
            📚 Riwayat
          </button>
        </nav>
      </header>

      <main style={s.main}>
        {page === "form" ? (
          <FormJadwal tanggal={tanggalAktif} setTanggal={setTanggalAktif} />
        ) : (
          <Riwayat
            onPilih={(tgl) => {
              setTanggalAktif(tgl);
              setPage("form");
            }}
          />
        )}
      </main>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    background: "#fff",
    borderBottom: "1px solid #eef0f3",
    padding: "14px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    position: "sticky",
    top: 0,
    zIndex: 50,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
    boxShadow: "0 2px 6px rgba(37,99,235,0.35)",
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1.2,
  },
  subtitle: {
    margin: 0,
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 1.2,
  },
  nav: {
    display: "flex",
    gap: 6,
    background: "#f3f4f6",
    padding: 4,
    borderRadius: 10,
  },
  navBtn: {
    padding: "8px 14px",
    background: "transparent",
    border: 0,
    borderRadius: 7,
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
    color: "#374151",
    whiteSpace: "nowrap",
  },
  navActive: {
    padding: "8px 14px",
    background: "#fff",
    border: 0,
    borderRadius: 7,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    color: "#2563eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    whiteSpace: "nowrap",
  },
  main: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "20px 16px 60px",
  },
};
