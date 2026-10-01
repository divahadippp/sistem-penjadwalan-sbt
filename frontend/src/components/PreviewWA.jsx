import { useEffect, useState } from "react";

/* ============================================================
   Hook: deteksi mobile via inline (tanpa CSS file)
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

export default function PreviewWA({ text }) {
  const isMobile = useIsMobile(640);

  const shareWA = () => {
    if (!text) return alert("Preview kosong. Simpan dulu.");
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert("📋 Teks disalin ke clipboard");
    } catch {
      alert("Gagal copy");
    }
  };

  const isEmpty = !text;

  return (
    <div style={s.wrapper}>
      {/* ===== HEADER ===== */}
      <div style={{ ...s.head, ...(isMobile ? s.headMobile : {}) }}>
        <div style={s.headLeft}>
          <div style={s.iconBox}>📱</div>
          <div>
            <h2 style={s.title}>Preview WhatsApp</h2>
            {!isMobile && (
              <p style={s.subtitle}>
                Siap dikirim ke grup — cek dulu sebelum share
              </p>
            )}
          </div>
        </div>

        <div
          style={{
            ...s.actions,
            ...(isMobile ? s.actionsMobile : {}),
          }}
        >
          <button
            onClick={copyText}
            style={{ ...s.btnCopy, ...(isMobile ? s.btnFull : {}) }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4b5563")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#6b7280")}
          >
            📋 <span>{isMobile ? "Copy" : "Copy"}</span>
          </button>
          <button
            onClick={shareWA}
            style={{ ...s.btnShare, ...(isMobile ? s.btnFull : {}) }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1eb155")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#25D366")}
          >
            🟢 <span>Share ke WhatsApp</span>
          </button>
        </div>
      </div>

      {/* ===== PREVIEW AREA (gaya chat WhatsApp) ===== */}
      <div style={s.waFrame}>
        {/* Top bar mini */}
        <div style={s.waTopBar}>
          <div style={s.waAvatar}>SBT</div>
          <div style={s.waTopInfo}>
            <div style={s.waTopName}>Briefing Pagi</div>
            <div style={s.waTopStatus}>siap dikirim</div>
          </div>
          <div style={s.waTopIcons}>
            <span>📞</span>
            <span>⋮</span>
          </div>
        </div>

        {/* Bubble chat */}
        <div style={s.waChatArea}>
          {isEmpty ? (
            <div style={s.emptyBox}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              <div style={{ fontWeight: 600, color: "#6b7280", fontSize: 14 }}>
                Belum ada preview
              </div>
              <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>
                Simpan jadwal dulu untuk melihat preview
              </div>
            </div>
          ) : (
            <div style={s.bubble}>
              <pre style={s.pre}>{text}</pre>
              <div style={s.bubbleMeta}>
                <span>
                  {new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span style={{ color: "#53bdeb", marginLeft: 4 }}>✓✓</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== TIPS (desktop only) ===== */}
      {!isMobile && !isEmpty && (
        <div style={s.tips}>
          💡 <b>Tips:</b> Klik <b>Share ke WhatsApp</b>, lalu pilih grup tujuan
          di aplikasi WhatsApp.
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STYLING — Full Inline
   ============================================================ */
const s = {
  wrapper: {
    marginTop: 30,
  },

  /* ----- Header ----- */
  head: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },
  headMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  headLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "linear-gradient(135deg, #25D366, #1eb155)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    color: "#fff",
    boxShadow: "0 2px 8px rgba(37,211,102,0.35)",
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1.2,
  },
  subtitle: {
    margin: 0,
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  actionsMobile: {
    width: "100%",
    flexDirection: "column",
  },
  btnCopy: {
    padding: "10px 16px",
    background: "#6b7280",
    color: "#fff",
    border: 0,
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "background 0.15s ease",
    whiteSpace: "nowrap",
  },
  btnShare: {
    padding: "10px 20px",
    background: "#25D366",
    color: "#fff",
    border: 0,
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "background 0.15s ease",
    boxShadow: "0 2px 8px rgba(37,211,102,0.35)",
    whiteSpace: "nowrap",
  },
  btnFull: {
    width: "100%",
  },

  /* ----- WhatsApp frame ----- */
  waFrame: {
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    background: "#0b141a",
  },

  /* Top bar ala WhatsApp */
  waTopBar: {
    background: "#202c33",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderBottom: "1px solid #2a3942",
  },
  waAvatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #25D366, #128C7E)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 12,
    flexShrink: 0,
  },
  waTopInfo: {
    flex: 1,
    minWidth: 0,
  },
  waTopName: {
    color: "#e9edef",
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.2,
  },
  waTopStatus: {
    color: "#8696a0",
    fontSize: 11,
    lineHeight: 1.2,
  },
  waTopIcons: {
    display: "flex",
    gap: 14,
    color: "#8696a0",
    fontSize: 16,
    flexShrink: 0,
  },

  /* Chat area */
  waChatArea: {
    padding: 16,
    background: "linear-gradient(180deg, #0b141a 0%, #111b21 100%)",
    minHeight: 200,
    maxHeight: 560,
    overflowY: "auto",
  },

  /* Bubble chat */
  bubble: {
    background: "#005c4b",
    borderRadius: 10,
    padding: "10px 12px 6px",
    maxWidth: "100%",
    boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
    position: "relative",
  },
  pre: {
    margin: 0,
    color: "#e9edef",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: 13.5,
    lineHeight: 1.55,
    overflowX: "auto",
  },
  bubbleMeta: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    color: "#8696a0",
    marginTop: 4,
  },

  /* Empty state */
  emptyBox: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#8696a0",
  },

  /* Tips */
  tips: {
    marginTop: 12,
    padding: "10px 14px",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    borderRadius: 9,
    fontSize: 13,
    color: "#1e40af",
  },
};
