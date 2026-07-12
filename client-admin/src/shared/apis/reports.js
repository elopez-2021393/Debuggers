import { axiosReports } from './api.js';

export const getReporteRestaurante = (restaurantId) =>
    axiosReports.get(`/api/reports/restaurant/${restaurantId}`);

export const getReportePlataforma = () =>
    axiosReports.get('/api/reports/plataforma');

export const limpiarCacheReporte = (restaurantId) =>
    axiosReports.delete(`/api/reports/cache/${restaurantId}`);

export const limpiarCachePlataforma = () =>
    axiosReports.delete('/api/reports/cache/plataforma');