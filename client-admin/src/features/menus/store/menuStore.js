import { create } from 'zustand';
import {
  getMenus as getMenusRequest,
  createMenu as createMenuRequest,
  getMenusByRestaurant as getMenusByRestaurantRequest,
  updateMenu as updateMenuRequest,
  deleteMenu as deleteMenuRequest,
} from '../../../shared/apis';

export const useMenuStore = create((set, get) => ({
  menus: [],
  loading: false,
  error: null,

  getMenus: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getMenusRequest();
      set({ menus: response.data.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Error al listar los menús',
        loading: false,
      });
    }
  },

  createMenu: async (formData) => {
    try {
      set({ loading: true, error: null });
      const response = await createMenuRequest(formData);

      set({
        menus: [response.data.data, ...get().menus],
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Error al crear el menú',
        loading: false,
      });
    }
  },

  getMenusByRestaurant: async (restaurantId) => {
    try {
      set({ loading: true, error: null });
      const response = await getMenusByRestaurantRequest(restaurantId);
      set({ menus: response.data.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Error al obtener los menús del restaurante.',
        loading: false,
      });
    }
  },

  updateMenu: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const response = await updateMenuRequest(id, data);
      set({
        menus: get().menus.map((menu) => (menu._id === id ? response.data.data : menu)),
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Error al actualizar el menú.',
        loading: false,
      });
    }
  },

  deleteMenu: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteMenuRequest(id);
      set({
        menus: get().menus.filter((menu) => menu._id !== id),
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Error al eliminar el menú.',
        loading: false,
      });
    }
  },
}));
