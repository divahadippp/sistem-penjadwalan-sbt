import { useEffect, useMemo, useState } from "react";
import { getRiwayat, hapusJadwal } from "../api";

/* ============================================================
   Hook: deteksi mobile
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

/* ============================================================
   Helpers
   ============================================================ */
function toDateStr(val) {
  if (!val) return "";
  if (typeof val === "string") return val.slice(0, 10);
  const d = new Date(val);
  if (isNaN(d)) return "";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatWaktu(val) {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d)) return "-";
  return d.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTanggalPanjang(tglStr) {
  if (!tglStr) return "-";
  const d = new Date(tglStr + "T00:00:00");
  if (isNaN(d)) return tglStr;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getHariPendek(tglStr) {
  if (!tglStr) return "";
  const d = new Date(tglStr + "T00:00:00");
  if (isNaN(d)) return "";
  return d.toLocaleDateString("id-ID", { weekday: "short" });
}

function getBulanPendek(tglStr) {
  if (!tglStr) return "";
  const d = new Date(tglStr + "T00:00:00");
  if (isNaN(d)) return "";
  return d.toLocaleDateString("id-ID", { month: "short" });
}

function getHariIni() {
  return new Date().toISOString().slice(0, 10);
}

function isHariIni(tglStr) {
  return tglStr === getHariIni();
}

function buildPageNumbers(current, total, sibling = 1) {
  const totalNumbers = sibling * 2 + 5;
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const left = Math.max(current - sibling, 2);
  const right = Math.min(current + sibling, total - 1);
  const pages = [1];
  if (left > 2) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

/* ============================================================
   KOMPONEN: Detail tugas per divisi
   ============================================================ */
function DetailTugasList({ divisi, filter }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {divisi.map((d, di) => {
        const tugas = (d.tugas || []).filter((t) => {
          if (filter === "belum") return !t.selesai;
          if (filter === "selesai") return !!t.selesai;
          return true;
        });

        if (tugas.length === 0) return null;

        return (
          <div key={di} style={s.divGroup}>
            <div style={s.divGroupHead}>
              <span style={s.divGroupIcon}>📍</span>
              <span style={s.divGroupName}>{d.nama}</span>
              <span style={s.divGroupCount}>{tugas.length} tugas</span>
            </div>

            <div style={s.tugasList}>
              {tugas.map((t, ti) => {
                const done = !!t.selesai;
                return (
                  <div
                    key={ti}
                    style={{
                      ...s.tugasRow,
                      ...(done ? s.tugasRowDone : s.tugasRowPending),
                    }}
                  >
                    <div style={s.tugasCheck}>{done ? "✅" : "⏳"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          ...s.tugasDeskripsi,
                          ...(done ? s.tugasDeskripsiDone : {}),
                        }}
                      >
                        {t.deskripsi}
                      </div>
                      <div style={s.tugasMeta}>
                        {t.teknisi && (
                          <span style={s.tugasMetaItem}>👤 {t.teknisi}</span>
                        )}
                        {t.jam && (
                          <span style={s.tugasMetaItem}>⏰ {t.jam}</span>
                        )}
                        {done && t.jam_selesai && (
                          <span
                            style={{
                              ...s.tugasMetaItem,
                              ...s.tugasMetaDone,
                            }}
                          >
                            ✅ {t.jam_selesai}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   KOMPONEN UTAMA
   ============================================================ */
export default function Riwayat({ onPilih }) {
  const isMobile = useIsMobile(640);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [detailFilter, setDetailFilter] = useState("semua");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getRiwayat();
      setList(data);
      setPage(1);
      setExpandedId(null);
    } catch (e) {
      alert("Gagal load riwayat: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const hapus = async (tgl) => {
    if (!confirm(`Hapus jadwal ${tgl}?`)) return;
    try {
      await hapusJadwal(tgl);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setDetailFilter("semua");
  };

  /* ===== SORT ===== */
  const sortedList = useMemo(() => {
    const arr = [...list];
    arr.sort((a, b) => {
      const ta = toDateStr(a.tanggal);
      const tb = toDateStr(b.tanggal);
      return sortOrder === "desc" ? tb.localeCompare(ta) : ta.localeCompare(tb);
    });
    return arr;
  }, [list, sortOrder]);

  /* ===== PAGINATION ===== */
  const totalItems = sortedList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const startIndex = (page - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalItems);
  const pageItems = sortedList.slice(startIndex, endIndex);

  const pageNumbers = useMemo(
    () => buildPageNumbers(page, totalPages, 1),
    [page, totalPages],
  );

  const handleSort = (order) => {
    setSortOrder(order);
    setPage(1);
  };
  const handlePerPage = (n) => {
    setPerPage(n);
    setPage(1);
  };

  /* ===== STATISTIK ===== */
  const stat = useMemo(() => {
    const totalHari = list.length;
    const totalDivisi = list.reduce((a, r) => a + (r.total_divisi || 0), 0);
    const totalTugas = list.reduce((a, r) => a + (r.total_tugas || 0), 0);
    const totalSelesai = list.reduce((a, r) => a + (r.total_selesai || 0), 0);
    const totalBelum = totalTugas - totalSelesai;
    const percent =
      totalTugas > 0 ? Math.round((totalSelesai / totalTugas) * 100) : 0;
    return {
      totalHari,
      totalDivisi,
      totalTugas,
      totalSelesai,
      totalBelum,
      percent,
    };
  }, [list]);

  const percentColor =
    stat.percent === 100
      ? "#059669"
      : stat.percent >= 50
        ? "#2563eb"
        : stat.percent > 0
          ? "#f59e0b"
          : "#9ca3af";

  if (loading) {
    return (
      <div style={s.loadingBox}>
        <div style={s.spinner}></div>
        <p style={{ color: "#6b7280", marginTop: 12 }}>Memuat riwayat...</p>
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      {/* ===== HEADER CARD ===== */}
      <div style={s.headerCard}>
        <div style={s.headerTop}>
          <div style={s.headerLeft}>
            <div style={s.headerIcon}>📚</div>
            <div>
              <h2 style={s.title}>Riwayat Jadwal</h2>
              <p style={s.subtitle}>
                {stat.totalHari > 0
                  ? `${stat.totalHari} hari tercatat • ${stat.totalDivisi} divisi`
                  : "Belum ada jadwal tersimpan"}
              </p>
            </div>
          </div>
          <button onClick={load} style={s.btnReload}>
            🔄 Reload
          </button>
        </div>

        {stat.totalHari > 0 && (
          <div style={s.summaryCard}>
            <div style={s.summaryTop}>
              <div>
                <div style={s.summaryLabel}>PROGRESS KESELURUHAN</div>
                <div style={s.summaryValue}>
                  <span style={{ color: percentColor }}>{stat.percent}%</span>
                  <span style={s.summarySub}>
                    {" "}
                    ({stat.totalSelesai}/{stat.totalTugas} tugas)
                  </span>
                </div>
              </div>
              <div style={s.summaryRight}>
                <div style={s.summaryPill("green")}>
                  ✅ {stat.totalSelesai} selesai
                </div>
                <div style={s.summaryPill("orange")}>
                  ⏳ {stat.totalBelum} belum
                </div>
              </div>
            </div>

            <div style={s.progressBarBgBig}>
              <div
                style={{
                  ...s.progressBarFillBig,
                  width: `${stat.percent}%`,
                  background: `linear-gradient(90deg, ${percentColor}, ${percentColor}dd)`,
                }}
              ></div>
            </div>
          </div>
        )}

        {stat.totalHari > 0 && (
          <div
            style={{
              ...s.statsRow,
              ...(isMobile ? s.statsRowMobile : {}),
            }}
          >
            <div style={s.statBox}>
              <div style={s.statIcon}>📅</div>
              <div style={s.statValue}>{stat.totalHari}</div>
              <div style={s.statLabel}>Hari</div>
            </div>
            <div style={s.statBox}>
              <div style={s.statIcon}>📁</div>
              <div style={s.statValue}>{stat.totalDivisi}</div>
              <div style={s.statLabel}>Divisi</div>
            </div>
            <div style={s.statBox}>
              <div style={s.statIcon}>📝</div>
              <div style={s.statValue}>{stat.totalTugas}</div>
              <div style={s.statLabel}>Total Tugas</div>
            </div>
            <div style={s.statBox}>
              <div style={s.statIcon}>✅</div>
              <div style={{ ...s.statValue, color: "#059669" }}>
                {stat.totalSelesai}
              </div>
              <div style={s.statLabel}>Selesai</div>
            </div>
          </div>
        )}
      </div>

      {/* ===== TOOLBAR ===== */}
      {stat.totalHari > 1 && (
        <div
          style={{
            ...s.toolBar,
            ...(isMobile ? s.toolBarMobile : {}),
          }}
        >
          <div style={s.toolGroup}>
            <span style={s.toolLabel}>Urutkan:</span>
            <button
              onClick={() => handleSort("desc")}
              style={sortOrder === "desc" ? s.sortBtnActive : s.sortBtnInactive}
            >
              ⬇️ Terbaru
            </button>
            <button
              onClick={() => handleSort("asc")}
              style={sortOrder === "asc" ? s.sortBtnActive : s.sortBtnInactive}
            >
              ⬆️ Terlama
            </button>
          </div>

          <div style={s.toolGroup}>
            <span style={s.toolLabel}>Per halaman:</span>
            <select
              value={perPage}
              onChange={(e) => handlePerPage(Number(e.target.value))}
              style={s.selectPerPage}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      {/* ===== EMPTY ===== */}
      {stat.totalHari === 0 && (
        <div style={s.emptyBox}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>📭</div>
          <div style={{ fontWeight: 700, color: "#374151", fontSize: 15 }}>
            Belum ada data
          </div>
          <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>
            Simpan jadwal dulu di tab <b>Form Jadwal</b>
          </div>
        </div>
      )}

      {/* ===== INFO RANGE ===== */}
      {stat.totalHari > 0 && (
        <div style={s.infoRange}>
          Menampilkan <b>{totalItems === 0 ? 0 : startIndex + 1}</b>–
          <b>{endIndex}</b> dari <b>{totalItems}</b> jadwal
        </div>
      )}

      {/* ===== LIST ===== */}
      {pageItems.map((r) => {
        const tgl = toDateStr(r.tanggal);
        const today = isHariIni(tgl);
        const hariPendek = getHariPendek(tgl);
        const bulanPendek = getBulanPendek(tgl);
        const tanggalAngka = new Date(tgl + "T00:00:00").getDate();

        const total = r.total_tugas || 0;
        const selesai = r.total_selesai || 0;
        const belum = total - selesai;
        const percent = total > 0 ? Math.round((selesai / total) * 100) : 0;
        const isExpanded = expandedId === r.id;

        const pColor =
          percent === 100
            ? "#059669"
            : percent >= 50
              ? "#2563eb"
              : percent > 0
                ? "#f59e0b"
                : "#9ca3af";

        return (
          <div
            key={r.id}
            style={{
              ...s.item,
              ...(today ? s.itemToday : {}),
              ...(isExpanded ? s.itemExpanded : {}),
            }}
          >
            {/* ===== HEADER ITEM ===== */}
            <div
              style={{
                ...s.itemHeader,
                ...(isMobile ? s.itemHeaderMobile : {}),
              }}
            >
              <div style={s.itemLeft}>
                <div
                  style={{
                    ...s.dateIcon,
                    ...(today ? s.dateIconToday : {}),
                  }}
                >
                  <div style={s.dateIconHari}>{hariPendek}</div>
                  <div style={s.dateIconTanggal}>{tanggalAngka}</div>
                  <div style={s.dateIconBulan}>{bulanPendek}</div>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={s.itemDate}>
                    {formatTanggalPanjang(tgl)}
                    {today && <span style={s.todayBadge}>Hari ini</span>}
                  </div>
                  <div style={s.itemMeta}>
                    📁 {r.total_divisi || 0} divisi &nbsp;•&nbsp; 📝 {total}{" "}
                    tugas &nbsp;•&nbsp; ✅ {selesai} selesai &nbsp;•&nbsp; ⏳{" "}
                    {belum} belum
                  </div>
                </div>
              </div>

              <div
                style={{
                  ...s.progressWrap,
                  ...(isMobile ? s.progressWrapMobile : {}),
                }}
              >
                <div style={s.progressBarBg}>
                  <div
                    style={{
                      ...s.progressBarFill,
                      width: `${percent}%`,
                      background: `linear-gradient(90deg, ${pColor}, ${pColor}dd)`,
                    }}
                  ></div>
                </div>
                <span style={{ ...s.percentText, color: pColor }}>
                  {percent}%
                </span>
              </div>
            </div>

            {/* ===== DETAIL EXPAND ===== */}
            {isExpanded && (
              <div style={s.detailBox}>
                <div style={s.filterBar}>
                  <span style={s.filterLabel}>Tampilkan:</span>
                  <button
                    onClick={() => setDetailFilter("semua")}
                    style={
                      detailFilter === "semua"
                        ? s.filterBtnActive
                        : s.filterBtnInactive
                    }
                  >
                    Semua ({total})
                  </button>
                  <button
                    onClick={() => setDetailFilter("belum")}
                    style={
                      detailFilter === "belum"
                        ? { ...s.filterBtnActive, background: "#f59e0b" }
                        : s.filterBtnInactive
                    }
                  >
                    ⏳ Belum ({belum})
                  </button>
                  <button
                    onClick={() => setDetailFilter("selesai")}
                    style={
                      detailFilter === "selesai"
                        ? { ...s.filterBtnActive, background: "#059669" }
                        : s.filterBtnInactive
                    }
                  >
                    ✅ Selesai ({selesai})
                  </button>
                </div>

                {r.divisi && r.divisi.length > 0 ? (
                  <DetailTugasList divisi={r.divisi} filter={detailFilter} />
                ) : (
                  <div style={s.emptyDetail}>
                    Belum ada detail tugas untuk jadwal ini.
                  </div>
                )}

                <div style={s.detailTimeRow}>
                  <span style={s.detailTimeItem}>
                    🕐 Dibuat: {formatWaktu(r.dibuat_pada)}
                  </span>
                  <span style={s.detailTimeItem}>
                    🔄 Update: {formatWaktu(r.diupdate_pada)}
                  </span>
                </div>
              </div>
            )}

            {/* ===== ACTIONS ===== */}
            <div
              style={{
                ...s.actions,
                ...(isMobile ? s.actionsMobile : {}),
              }}
            >
              <button
                onClick={() => toggleExpand(r.id)}
                style={{
                  ...s.btnDetail,
                  ...(isMobile ? s.btnFlex : {}),
                }}
              >
                {isExpanded ? "▲ Sembunyikan" : "▼ Detail Tugas"}
              </button>
              <button
                onClick={() => onPilih(tgl)}
                style={{
                  ...s.btnBuka,
                  ...(isMobile ? s.btnFlex : {}),
                }}
              >
                📂 Buka
              </button>
              <button
                onClick={() => hapus(tgl)}
                style={{
                  ...s.btnHapus,
                  ...(isMobile ? s.btnFlex : {}),
                }}
              >
                🗑️ Hapus
              </button>
            </div>
          </div>
        );
      })}

      {/* ===== PAGINATION ===== */}
      {totalPages > 1 && (
        <div
          style={{
            ...s.paginationBar,
            ...(isMobile ? s.paginationBarMobile : {}),
          }}
        >
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              ...s.pageBtn,
              ...(page === 1 ? s.pageBtnDisabled : {}),
            }}
          >
            ← Prev
          </button>

          <div style={s.pageNumbers}>
            {pageNumbers.map((n, i) => {
              if (n === "…") {
                return (
                  <span key={`e${i}`} style={s.pageEllipsis}>
                    …
                  </span>
                );
              }
              const isActive = n === page;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  style={isActive ? s.pageNumActive : s.pageNumInactive}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            style={{
              ...s.pageBtn,
              ...(page === totalPages ? s.pageBtnDisabled : {}),
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STYLING
   ============================================================ */
const s = {
  wrapper: { display: "flex", flexDirection: "column", gap: 14 },

  headerCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #eef0f3",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12, minWidth: 0 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    boxShadow: "0 2px 6px rgba(37,99,235,0.3)",
    flexShrink: 0,
  },
  title: { margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" },
  subtitle: { margin: 0, fontSize: 12.5, color: "#6b7280", marginTop: 2 },
  btnReload: {
    padding: "9px 16px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    border: 0,
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    boxShadow: "0 2px 6px rgba(16,185,129,0.3)",
    whiteSpace: "nowrap",
  },

  summaryCard: {
    background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
    border: "1px solid #bae6fd",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  summaryTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0369a1",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
    marginTop: 2,
  },
  summarySub: { fontSize: 13, fontWeight: 600, color: "#6b7280" },
  summaryRight: { display: "flex", gap: 8, flexWrap: "wrap" },
  summaryPill: (color) => ({
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    background: color === "green" ? "#ecfdf5" : "#fff7ed",
    color: color === "green" ? "#059669" : "#c2410c",
    border: color === "green" ? "1px solid #d1fae5" : "1px solid #fed7aa",
    whiteSpace: "nowrap",
  }),
  progressBarBgBig: {
    width: "100%",
    height: 10,
    background: "#fff",
    borderRadius: 6,
    overflow: "hidden",
    border: "1px solid #bae6fd",
  },
  progressBarFillBig: {
    height: "100%",
    borderRadius: 6,
    transition: "width 0.4s ease",
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
    marginTop: 16,
  },
  statsRowMobile: { gridTemplateColumns: "repeat(2, 1fr)" },
  statBox: {
    background: "#f9fafb",
    padding: "12px 10px",
    borderRadius: 10,
    border: "1px solid #eef0f3",
    textAlign: "center",
  },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: {
    fontSize: 22,
    fontWeight: 800,
    color: "#2563eb",
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: 11.5,
    color: "#6b7280",
    marginTop: 4,
    fontWeight: 600,
  },

  toolBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    background: "#fff",
    border: "1px solid #eef0f3",
    borderRadius: 10,
    flexWrap: "wrap",
  },
  toolBarMobile: { flexDirection: "column", alignItems: "stretch" },
  toolGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  toolLabel: { fontSize: 13, fontWeight: 600, color: "#6b7280" },
  sortBtnActive: {
    padding: "6px 12px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12.5,
    fontWeight: 700,
  },
  sortBtnInactive: {
    padding: "6px 12px",
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12.5,
    fontWeight: 600,
  },
  selectPerPage: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 13,
    background: "#f9fafb",
    cursor: "pointer",
    outline: "none",
    fontWeight: 600,
    color: "#374151",
  },

  infoRange: { fontSize: 12.5, color: "#6b7280", padding: "0 4px" },

  emptyBox: {
    background: "#fff",
    borderRadius: 14,
    padding: "50px 20px",
    textAlign: "center",
    border: "1px dashed #d1d5db",
  },

  item: {
    background: "#fff",
    border: "1px solid #eef0f3",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
  },
  itemToday: {
    borderColor: "#bfdbfe",
    background: "linear-gradient(180deg, #f0f9ff 0%, #fff 40%)",
  },
  itemExpanded: { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  itemHeaderMobile: { flexDirection: "column", alignItems: "stretch" },
  itemLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: "1 1 220px",
    minWidth: 0,
  },
  dateIcon: {
    width: 52,
    height: 56,
    borderRadius: 11,
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 6px rgba(37,99,235,0.3)",
    lineHeight: 1,
    padding: "4px 0",
  },
  dateIconToday: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    boxShadow: "0 2px 6px rgba(16,185,129,0.35)",
  },
  dateIconHari: {
    fontSize: 9.5,
    fontWeight: 700,
    textTransform: "uppercase",
    opacity: 0.85,
  },
  dateIconTanggal: { fontSize: 18, fontWeight: 800, margin: "2px 0" },
  dateIconBulan: {
    fontSize: 9.5,
    fontWeight: 700,
    textTransform: "uppercase",
    opacity: 0.85,
  },

  itemDate: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  todayBadge: {
    background: "#ecfdf5",
    color: "#059669",
    fontSize: 10.5,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 20,
    border: "1px solid #d1fae5",
    whiteSpace: "nowrap",
  },
  itemMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 3,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  /* ----- Progress ----- */
  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 160,
    flex: "0 1 200px",
  },
  progressWrapMobile: {
    minWidth: 0,
    width: "100%",
    flex: "1 1 100%",
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    background: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.35s ease",
  },
  percentText: {
    fontSize: 12.5,
    fontWeight: 800,
    minWidth: 40,
    textAlign: "right",
  },

  /* ----- Detail expand ----- */
  detailBox: {
    background: "#f9fafb",
    border: "1px solid #eef0f3",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  /* ----- Filter bar ----- */
  filterBar: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: "1px dashed #e5e7eb",
  },
  filterLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "#6b7280",
  },
  filterBtnActive: {
    padding: "6px 12px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    boxShadow: "0 2px 4px rgba(37,99,235,0.25)",
  },
  filterBtnInactive: {
    padding: "6px 12px",
    background: "#fff",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },

  /* ----- Divisi group dalam detail ----- */
  divGroup: {
    background: "#fff",
    border: "1px solid #eef0f3",
    borderRadius: 10,
    padding: 12,
  },
  divGroupHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: "1px solid #f3f4f6",
  },
  divGroupIcon: { fontSize: 15 },
  divGroupName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    flex: 1,
  },
  divGroupCount: {
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 20,
  },

  /* ----- Tugas list dalam detail ----- */
  tugasList: { display: "flex", flexDirection: "column", gap: 6 },
  tugasRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid transparent",
  },
  tugasRowDone: { background: "#ecfdf5", borderColor: "#d1fae5" },
  tugasRowPending: { background: "#fffbeb", borderColor: "#fef3c7" },
  tugasCheck: { fontSize: 15, flexShrink: 0, lineHeight: 1.3 },
  tugasDeskripsi: {
    fontSize: 13.5,
    fontWeight: 600,
    color: "#111827",
    lineHeight: 1.4,
    wordBreak: "break-word",
  },
  tugasDeskripsiDone: {
    textDecoration: "line-through",
    color: "#6b7280",
    fontWeight: 500,
  },
  tugasMeta: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
    fontSize: 11.5,
  },
  tugasMetaItem: {
    color: "#6b7280",
    background: "#f3f4f6",
    padding: "2px 8px",
    borderRadius: 5,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  tugasMetaDone: { background: "#d1fae5", color: "#065f46" },

  emptyDetail: {
    padding: "16px 12px",
    textAlign: "center",
    fontSize: 13,
    color: "#9ca3af",
    background: "#fff",
    borderRadius: 8,
    border: "1px dashed #e5e7eb",
  },

  /* ----- Info waktu ----- */
  detailTimeRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTop: "1px dashed #e5e7eb",
    fontSize: 11.5,
    color: "#6b7280",
  },
  detailTimeItem: { fontWeight: 600 },

  /* ----- Actions ----- */
  actions: { display: "flex", gap: 8, flexWrap: "wrap" },
  actionsMobile: { width: "100%" },
  btnFlex: { flex: 1, minWidth: 0, justifyContent: "center" },
  btnDetail: {
    padding: "8px 14px",
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 12.5,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    whiteSpace: "nowrap",
  },
  btnBuka: {
    padding: "8px 14px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: 0,
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 12.5,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    boxShadow: "0 2px 5px rgba(37,99,235,0.28)",
    whiteSpace: "nowrap",
  },
  btnHapus: {
    padding: "8px 14px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fee2e2",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 12.5,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    whiteSpace: "nowrap",
  },

  /* ----- Pagination ----- */
  paginationBar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: "14px 16px",
    background: "#fff",
    border: "1px solid #eef0f3",
    borderRadius: 12,
    flexWrap: "wrap",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    marginTop: 4,
  },
  paginationBarMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
  },
  pageBtn: {
    padding: "8px 14px",
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    whiteSpace: "nowrap",
  },
  pageBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  pageNumbers: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
    justifyContent: "center",
    flex: 1,
  },
  pageNumActive: {
    minWidth: 36,
    height: 36,
    padding: "0 10px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: 0,
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 800,
    boxShadow: "0 2px 5px rgba(37,99,235,0.3)",
  },
  pageNumInactive: {
    minWidth: 36,
    height: 36,
    padding: "0 10px",
    background: "#fff",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  pageEllipsis: {
    minWidth: 24,
    height: 36,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: 700,
    userSelect: "none",
  },

  /* ----- Loading ----- */
  loadingBox: {
    background: "#fff",
    borderRadius: 14,
    padding: "60px 20px",
    textAlign: "center",
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
