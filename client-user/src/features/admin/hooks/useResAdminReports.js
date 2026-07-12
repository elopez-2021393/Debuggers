// client-user/src/features/admin/hooks/useResAdminReports.js

import { useCallback } from "react";
import { useReportsStore } from "../store/reportsStore";
import { useAuthStore } from "../../../shared/store/authStore";

export const useResAdminReports = () => {
    const user = useAuthStore((s) => s.user);
    const restaurantId = user?.restaurantId;

    const {
        reporte,
        loading,
        error,
        getReporteRestaurante,
        limpiarCache,
        clearError,
    } = useReportsStore();

    const fetchReporte = useCallback(() => {
        if (!restaurantId) return;
        getReporteRestaurante(restaurantId);
    }, [restaurantId, getReporteRestaurante]);

    const handleLimpiarCache = useCallback(async () => {
        if (!restaurantId) return;
        const result = await limpiarCache(restaurantId);
        if (result.ok) {
            getReporteRestaurante(restaurantId);
        }
        return result;
    }, [restaurantId, limpiarCache, getReporteRestaurante]);

    return {
        reporte,
        loading,
        error,
        restaurantId,
        fetchReporte,
        limpiarCache: handleLimpiarCache,
        clearError,
    };
};