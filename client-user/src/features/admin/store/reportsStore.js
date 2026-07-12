// client-user/src/features/admin/store/reportsStore.js

import { create } from "zustand";
import reportsClient from "../../../shared/api/reportsClient";

export const useReportsStore = create((set) => ({
  reporte: null,
  reportePlataforma: null,
  loading: false,
  loadingPlataforma: false,
  error: null,

  getReporteRestaurante: async (restaurantId) => {
    try {
      set({ loading: true, error: null });
      const res = await reportsClient.get(`/api/reports/restaurant/${restaurantId}`);
      set({ reporte: res.data.data || res.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Error al obtener el reporte del restaurante",
        loading: false,
      });
    }
  },

  getReportePlataforma: async () => {
    try {
      set({ loadingPlataforma: true, error: null });
      const res = await reportsClient.get("/api/reports/plataforma");
      set({ reportePlataforma: res.data.data || res.data, loadingPlataforma: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Error al obtener el reporte de plataforma",
        loadingPlataforma: false,
      });
    }
  },

  limpiarCachePlataforma: async () => {
    try {
      await reportsClient.delete("/api/reports/cache/plataforma");
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err.response?.data?.message || err.message || "Error al limpiar caché",
      };
    }
  },

  limpiarCache: async (restaurantId) => {
    try {
      await reportsClient.delete(`/api/reports/cache/${restaurantId}`);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err.response?.data?.message || err.message || "Error al limpiar el caché",
      };
    }
  },

  clearError: () => set({ error: null }),
}));
