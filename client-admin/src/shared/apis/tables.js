import { axiosRestaurant } from './api.js';

const BASE = '/tables';

export const getTablesByRestaurant = (restaurantId) =>
  axiosRestaurant.get(`${BASE}/restaurant/${restaurantId}`);

export const getTableById = (tableId) => axiosRestaurant.get(`${BASE}/${tableId}`);

export const createTable = (data) => axiosRestaurant.post(BASE, data);

export const updateTable = (tableId, data) => axiosRestaurant.patch(`${BASE}/${tableId}`, data);

export const toggleTableStatus = (tableId) => axiosRestaurant.patch(`${BASE}/${tableId}/status`);

export const deleteTable = (tableId) => axiosRestaurant.delete(`${BASE}/${tableId}`);
