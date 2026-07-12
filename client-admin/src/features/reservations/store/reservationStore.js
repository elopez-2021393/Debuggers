import { create } from 'zustand';
import {
  getMyReservations,
  getReservationsByRestaurant,
  createReservation,
  updateReservation,
  deleteReservation,
  confirmOrCancel,
  checkDisponibilidad,
  getTablesByRestaurant,
} from '../../../shared/apis/reservations.js';

export const useReservationStore = create((set, get) => ({
  reservations: [],
  tables: [],
  availableTables: [],
  loading: false,
  loadingTables: false,
  error: null,

  // ── Mis reservaciones (usuario autenticado) ──
  fetchMyReservations: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await getMyReservations();
      set({ reservations: data.data, loading: false });
    } catch (e) {
      set({ error: e.response?.data?.message || 'Error al obtener reservaciones', loading: false });
    }
  },

  // ── Reservaciones de un restaurante (RES_ADMIN_ROLE) ──
  fetchByRestaurant: async (restaurantName, params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await getReservationsByRestaurant(restaurantName, params);
      set({ reservations: data.data, loading: false });
    } catch (e) {
      set({ error: e.response?.data?.message || 'Error al obtener reservaciones', loading: false });
    }
  },

  // ── Mesas de un restaurante ──
  fetchTables: async (restaurantId) => {
    set({ loadingTables: true });
    try {
      const { data } = await getTablesByRestaurant(restaurantId);
      set({ tables: data.data, loadingTables: false });
    } catch (e) {
      set({ tables: [], loadingTables: false });
    }
  },

  // ── Disponibilidad de mesas ──
  fetchDisponibilidad: async (restaurantName, date, hour) => {
    try {
      const { data } = await checkDisponibilidad(restaurantName, date, hour);
      set({ availableTables: data.data?.mesas || [] });
      return data.data;
    } catch (e) {
      set({ availableTables: [] });
      return null;
    }
  },

  clearAvailableTables: () => set({ availableTables: [] }),

  // ── Crear reservación ──
  addReservation: async (payload) => {
    try {
      const { data } = await createReservation(payload);
      set((s) => ({ reservations: [data.data, ...s.reservations] }));
      return {
        success: true,
        confirmationToken: data.confirmationToken,
        tokenExpiresAt: data.tokenExpiresAt,
      };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Error al crear reservación' };
    }
  },

  // ── Actualizar reservación ──
  editReservation: async (id, payload) => {
    try {
      const { data } = await updateReservation(id, payload);
      set((s) => ({
        reservations: s.reservations.map((r) => (r._id === id ? data.data : r)),
      }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Error al actualizar' };
    }
  },

  // ── Eliminar reservación ──
  removeReservation: async (id) => {
    try {
      await deleteReservation(id);
      set((s) => ({ reservations: s.reservations.filter((r) => r._id !== id) }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Error al eliminar' };
    }
  },

  // ── Confirmar / Cancelar con token ──
  processToken: async (token, action) => {
    try {
      const { data } = await confirmOrCancel(token, action);
      // Actualizar en lista si existe
      set((s) => ({
        reservations: s.reservations.map((r) => (r._id === data.data._id ? data.data : r)),
      }));
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Token inválido o expirado' };
    }
  },
}));
