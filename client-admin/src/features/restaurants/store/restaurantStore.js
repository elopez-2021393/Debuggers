import { create } from 'zustand';
import {
  getRestaurants as getRestaurantsRequest,
  createRestaurant as createRestaurantRequest,
  updateRestaurant as updateRestaurantRequest,
  deleteRestaurant as deleteRestaurantRequest,
  uploadRestaurantPhoto as uploadPhotoRequest,
  deleteRestaurantPhoto as deletePhotoRequest,
} from '../../../shared/apis';

export const useRestaurantStore = create((set, get) => ({
  restaurants: [],
  loading: false,
  error: null,

  getRestaurants: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getRestaurantsRequest();
      const data = response.data?.data ?? response.data ?? [];
      set({ restaurants: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Error al listar restaurantes',
        loading: false,
      });
    }
  },

  createRestaurant: async (formData) => {
    try {
      set({ loading: true, error: null });
      const response = await createRestaurantRequest(formData);
      set({
        restaurants: [response.data.data, ...get().restaurants],
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || 'Error al crear el restaurante',
      });
      throw err;
    }
  },

  updateRestaurant: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const response = await updateRestaurantRequest(id, data);
      set({
        restaurants: get().restaurants.map((r) => (r._id === id ? response.data.data : r)),
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || 'Error al actualizar el restaurante',
      });
      throw err;
    }
  },

  deleteRestaurant: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteRestaurantRequest(id);
      set({
        restaurants: get().restaurants.filter((r) => r._id !== id),
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || 'Error al eliminar el restaurante',
      });
    }
  },

  uploadPhoto: async (id, formData) => {
    try {
      set({ loading: true, error: null });
      const response = await uploadPhotoRequest(id, formData);
      set({
        restaurants: get().restaurants.map((r) => (r._id === id ? response.data.data : r)),
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || 'Error al subir la foto',
      });
      throw err;
    }
  },

  deletePhoto: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await deletePhotoRequest(id);
      set({
        restaurants: get().restaurants.map((r) => (r._id === id ? response.data.data : r)),
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || 'Error al eliminar la foto',
      });
    }
  },
}));
