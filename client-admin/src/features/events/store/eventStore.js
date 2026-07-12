// src/features/events/store/eventStore.js
import { create } from 'zustand';
import {
  getAllEvents,
  getEventsByRestaurant,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../../../shared/apis/events.js';

export const useEventStore = create((set, get) => ({
  events: [],
  loading: false,
  error: null,

  // ─── Listar todos los eventos ───
  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await getAllEvents();
      set({ events: data.data, loading: false });
    } catch (e) {
      set({ error: e.response?.data?.message || 'Error al obtener eventos', loading: false });
    }
  },

  // ─── Listar eventos de un restaurante específico ───
  fetchByRestaurant: async (restaurantId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await getEventsByRestaurant(restaurantId);
      set({ events: data.data, loading: false });
    } catch (e) {
      set({ error: e.response?.data?.message || 'Error al obtener eventos', loading: false });
    }
  },

  // ─── Crear evento ───
  addEvent: async (eventData) => {
    try {
      const { data } = await createEvent(eventData);
      set((state) => ({ events: [data.data, ...state.events] }));
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || 'Error al crear evento';
      return { success: false, error: msg };
    }
  },

  // ─── Actualizar evento ───
  editEvent: async (id, eventData) => {
    try {
      const { data } = await updateEvent(id, eventData);
      set((state) => ({
        events: state.events.map((ev) => (ev._id === id ? data.data : ev)),
      }));
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || 'Error al actualizar evento';
      return { success: false, error: msg };
    }
  },

  // ─── Eliminar evento ───
  removeEvent: async (id) => {
    try {
      await deleteEvent(id);
      set((state) => ({ events: state.events.filter((ev) => ev._id !== id) }));
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || 'Error al eliminar evento';
      return { success: false, error: msg };
    }
  },
}));
