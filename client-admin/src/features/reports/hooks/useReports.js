import { useCallback } from 'react';
import { useReportsStore } from '../store/reportsStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

export const useReports = () => {
    const restaurantId = useAuthStore((s) => s.user?.restaurantId);
    const {
        reporte,
        reportePlataforma,
        loading,
        loadingPlataforma,
        error,
        getReporteRestaurante,
        getReportePlataforma,
        limpiarCache,
        limpiarCachePlataforma,
        clearError,
    } = useReportsStore();

    const fetchReporte = useCallback(() => {
        if (!restaurantId) return;
        getReporteRestaurante(restaurantId);
    }, [restaurantId, getReporteRestaurante]);

    const fetchReportePlataforma = useCallback(() => {
        getReportePlataforma();
    }, [getReportePlataforma]);

    const handleLimpiarCache = useCallback(async () => {
        if (!restaurantId) return;
        const result = await limpiarCache(restaurantId);
        if (result.ok) {
            showSuccess('Caché limpiado. Recalculando reporte...');
            getReporteRestaurante(restaurantId);
        } else {
            showError(result.message);
        }
    }, [restaurantId, limpiarCache, getReporteRestaurante]);

    const handleLimpiarCachePlataforma = useCallback(async () => {
        await limpiarCachePlataforma();
        getReportePlataforma();
    }, [limpiarCachePlataforma, getReportePlataforma]);

    return {
        reporte,
        reportePlataforma,
        loading,
        loadingPlataforma,
        error,
        restaurantId,
        fetchReporte,
        fetchReportePlataforma,
        limpiarCache: handleLimpiarCache,
        limpiarCachePlataforma: handleLimpiarCachePlataforma,
        clearError,
    };
};