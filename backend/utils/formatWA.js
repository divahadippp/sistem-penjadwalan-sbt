function formatWA(jadwal, divisiList, kehadiranList) {
  const tgl = new Date(jadwal.tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ===== HEADER =====
  let text = `*BRIEFING PAGI* 🔥🔥🔥\n`;
  text += `📅 ${tgl}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  // ===== PER DIVISI =====
  for (const d of divisiList) {
    if (!d.tugas || d.tugas.length === 0) continue;

    text += `📍 *${(d.nama || "").toUpperCase()}*\n`;

    d.tugas.forEach((t, idx) => {
      // Nomor tugas
      text += `${idx + 1}. ${t.deskripsi}\n`;

      // Baris detail (teknisi & jam) — pakai bullet "   •"
      const detail = [];
      if (t.teknisi) detail.push(`👤 ${t.teknisi}`);
      if (t.jam) detail.push(`⏰ ${t.jam}`);
      if (t.selesai && t.jam_selesai) {
        detail.push(`✅ Selesai ${t.jam_selesai}`);
      } else if (t.selesai) {
        detail.push(`✅ Selesai`);
      }

      if (detail.length) {
        text += `   ${detail.join("  |  ")}\n`;
      }
    });

    text += `\n`;
  }

  // ===== BELUM BERANGKAT =====
  const telat = kehadiranList.filter((k) => k.status === "telat");
  const libur = kehadiranList.filter((k) => k.status === "libur");

  if (telat.length) {
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `⚠️ *BELUM BERANGKAT*\n`;
    telat.forEach((k) => {
      text += `• ${k.nama} _(izin telat)_\n`;
    });
    text += `\n`;
  }

  if (libur.length) {
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🏖️ *LIBUR*\n`;
    libur.forEach((k) => {
      text += `• ${k.nama}\n`;
    });
    text += `\n`;
  }

  // ===== FOOTER =====
  const totalTugas = divisiList.reduce((a, d) => a + (d.tugas?.length || 0), 0);
  const totalSelesai = divisiList.reduce(
    (a, d) => a + (d.tugas?.filter((t) => t.selesai).length || 0),
    0,
  );
  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📊 Progress: *${totalSelesai}/${totalTugas}* tugas selesai\n`;
  text += `🕐 Update: ${new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  })} WIB`;

  return text.trim();
}

module.exports = { formatWA };
