// src/shared/apis/events.js
import { axiosRestaurant } from './api.js';

const BASE = '/events';

/** Listar todos los eventos (ADMIN_ROLE, RES_ADMIN_ROLE) */
export const getAllEvents = () => axiosRestaurant.get(BASE);

/** Eventos activos de un restaurante (público) */
export const getEventsByRestaurant = (restaurantId) =>
  axiosRestaurant.get(`${BASE}/restaurant/${restaurantId}`);

/** Detalle de un evento */
export const getEventById = (id) => axiosRestaurant.get(`${BASE}/${id}`);

/** Crear evento (RES_ADMIN_ROLE) */
export const createEvent = (data) => axiosRestaurant.post(BASE, data);

/** Actualizar evento parcialmente (RES_ADMIN_ROLE) */
export const updateEvent = (id, data) => axiosRestaurant.patch(`${BASE}/${id}`, data);

/** Eliminar evento (RES_ADMIN_ROLE) */
export const deleteEvent = (id) => axiosRestaurant.delete(`${BASE}/${id}`);
