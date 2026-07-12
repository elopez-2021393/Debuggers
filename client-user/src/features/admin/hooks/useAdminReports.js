// client-user/src/features/admin/hooks/useAdminReports.js

import { useCallback } from "react";
import { useReportsStore } from "../store/reportsStore";

export const useAdminReports = () => {
  const {
    reportePlataforma,
    loadingPlataforma,
    error,
    getReportePlataforma,
    limpiarCachePlataforma,
    clearError,
  } = useReportsStore();

  const fetchPlatformReport = useCallback(() => {
    getReportePlataforma();
  }, [getReportePlataforma]);

  const clearCache = useCallback(async () => {
    const result = await limpiarCachePlataforma();
    if (result.ok) {
      await getReportePlataforma();
    }
    return result;
  }, [limpiarCachePlataforma, getReportePlataforma]);

  return {
    report: reportePlataforma,
    loading: loadingPlataforma,
    error,
    fetchPlatformReport,
    clearCache,
    clearError,
  };
};
