import { create } from 'zustand';
import {
    getReporteRestaurante,
    getReportePlataforma,
    limpiarCacheReporte,
    limpiarCachePlataforma as limpiarCachePlataformaRequest
} from '../../../shared/apis/reports.js';

export const useReportsStore = create((set) => ({
    reporte: null,
    reportePlataforma: null,
    loading: false,
    loadingPlataforma: false,
    error: null,

    getReporteRestaurante: async (restaurantId) => {
        try {
            set({ loading: true, error: null });
            const res = await getReporteRestaurante(restaurantId);
            set({ reporte: res.data.data, loading: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error al obtener el reporte',
                loading: false,
            });
        }
    },

    getReportePlataforma: async () => {
        try {
            set({ loadingPlataforma: true, error: null });
            const res = await getReportePlataforma();
            set({ reportePlataforma: res.data.data, loadingPlataforma: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error al obtener el reporte de plataforma',
                loadingPlataforma: false,
            });
        }
    },

    //Admin principal
    limpiarCachePlataforma: async () => {
        try {
            await limpiarCachePlataformaRequest();
            return { ok: true };
        } catch (err) {
            return { ok: false, message: err.response?.data?.message || 'Error al limpiar caché' };
        }
    },

    limpiarCache: async (restaurantId) => {
        try {
            await limpiarCacheReporte(restaurantId);
            return { ok: true };
        } catch (err) {
            return {
                ok: false,
                message: err.response?.data?.message || 'Error al limpiar el caché',
            };
        }
    },

    clearError: () => set({ error: null }),
}));