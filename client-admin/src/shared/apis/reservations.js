import { axiosRestaurant } from './api.js';

const BASE = '/reservations';

export const getMyReservations = () => axiosRestaurant.get(BASE);

export const getReservationsByRestaurant = (restaurantName, params = {}) =>
  axiosRestaurant.get(`${BASE}/restaurant/${encodeURIComponent(restaurantName)}`, { params });

export const createReservation = (data) => axiosRestaurant.post(BASE, data);

export const updateReservation = (id, data) => axiosRestaurant.put(`${BASE}/${id}`, data);

export const deleteReservation = (id) => axiosRestaurant.delete(`${BASE}/${id}`);

export const confirmOrCancel = (token, action) =>
  axiosRestaurant.post(`${BASE}/confirm`, { token, action });

export const checkDisponibilidad = (restaurantName, date, hour) =>
  axiosRestaurant.get(`${BASE}/disponibilidad/${encodeURIComponent(restaurantName)}`, {
    params: { date, hour },
  });

export const getTablesByRestaurant = (restaurantId) =>
  axiosRestaurant.get(`/tables/restaurant/${restaurantId}`);
