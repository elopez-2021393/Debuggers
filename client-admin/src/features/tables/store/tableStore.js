import { create } from 'zustand';
import {
  getTablesByRestaurant,
  createTable,
  updateTable,
  toggleTableStatus,
  deleteTable,
} from '../../../shared/apis/tables.js';

export const useTableStore = create((set, get) => ({
  tables: [],
  loading: false,
  error: null,

  fetchTables: async (restaurantId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await getTablesByRestaurant(restaurantId);
      set({ tables: data.data, loading: false });
    } catch (e) {
      set({ error: e.response?.data?.message || 'Error al obtener mesas', loading: false });
    }
  },

  addTable: async (payload) => {
    try {
      const { data } = await createTable(payload);
      set((s) => ({ tables: [...s.tables, data.data] }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Error al crear mesa' };
    }
  },

  editTable: async (tableId, payload) => {
    try {
      const { data } = await updateTable(tableId, payload);
      set((s) => ({
        tables: s.tables.map((t) => (t._id === tableId ? data.data : t)),
      }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Error al actualizar mesa' };
    }
  },

  toggleStatus: async (tableId) => {
    try {
      const { data } = await toggleTableStatus(tableId);
      set((s) => ({
        tables: s.tables.map((t) => (t._id === tableId ? data.data : t)),
      }));
      return { success: true, isActive: data.data.isActive };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Error al cambiar estado' };
    }
  },

  removeTable: async (tableId) => {
    try {
      await deleteTable(tableId);
      set((s) => ({ tables: s.tables.filter((t) => t._id !== tableId) }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Error al eliminar mesa' };
    }
  },

  clearTables: () => set({ tables: [], error: null }),
}));
