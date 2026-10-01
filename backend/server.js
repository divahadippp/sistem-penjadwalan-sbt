const express = require("express");
const cors = require("cors");
require("dotenv").config();

const jadwalRouter = require("./routes/jadwal");
const karyawanRouter = require("./routes/karyawan");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) =>
  res.json({
    ok: true,
    app: "SISTEM PENJADWALAN SBT",
    db: process.env.DB_NAME,
  }),
);

app.use("/api/jadwal", jadwalRouter);
app.use("/api/karyawan", karyawanRouter);

// Error handler global
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Backend SBT jalan di http://localhost:${PORT}`),
);
