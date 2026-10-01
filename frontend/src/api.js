import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const getJadwal = (tgl) => api.get(`/jadwal/${tgl}`).then((r) => r.data);
export const saveJadwal = (tgl, data) =>
  api.post(`/jadwal/${tgl}`, data).then((r) => r.data);
export const getPreview = (tgl) =>
  api.get(`/jadwal/${tgl}/preview`).then((r) => r.data);
export const getKaryawan = () => api.get("/karyawan").then((r) => r.data);
export const getRiwayat = () => api.get("/jadwal").then((r) => r.data);
export const hapusJadwal = (tgl) =>
  api.delete(`/jadwal/${tgl}`).then((r) => r.data);
export const getTemplate = () =>
  api.get("/jadwal/template").then((r) => r.data);
