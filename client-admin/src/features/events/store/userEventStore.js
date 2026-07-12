// src/features/events/store/userEventStore.js
import { create } from 'zustand';
import {
  getAllPublicEvents,
  joinEvent,
  leaveEvent,
  applyEvent,
} from '../../../shared/apis/userEvents.js';

export const useUserEventStore = create((set, get) => ({
  events: [],
  loading: false,
  error: null,

  /** Carga todos los eventos públicos/activos de todos los restaurantes */
  fetchPublicEvents: async (restaurants) => {
    if (!restaurants?.length) return;
    set({ loading: true, error: null });
    try {
      const events = await getAllPublicEvents(restaurants);
      set({ events, loading: false });
    } catch (e) {
      set({ error: 'Error al cargar eventos', loading: false });
    }
  },

  /** Inscribirse a un evento */
  join: async (eventId) => {
    try {
      const { data } = await joinEvent(eventId);
      // Actualizar current_capacity en el store local
      set((s) => ({
        events: s.events.map((ev) =>
          ev._id === eventId ? { ...ev, current_capacity: (ev.current_capacity || 0) + 1 } : ev
        ),
      }));
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Error al inscribirse' };
    }
  },

  /** Desinscribirse de un evento */
  leave: async (eventId) => {
    try {
      await leaveEvent(eventId);
      set((s) => ({
        events: s.events.map((ev) =>
          ev._id === eventId
            ? { ...ev, current_capacity: Math.max(0, (ev.current_capacity || 1) - 1) }
            : ev
        ),
      }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Error al desinscribirse' };
    }
  },

  /** Aplicar promoción o cupón */
  apply: async (eventId) => {
    try {
      const { data } = await applyEvent(eventId);
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Error al aplicar' };
    }
  },
}));
