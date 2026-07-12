import { axiosRestaurant } from './api.js';

export const getRestaurants = async () => {
  return await axiosRestaurant.get('/restaurants');
};

export const getRestaurantById = async (id) => {
  return await axiosRestaurant.get(`/restaurants/${id}`);
};

export const createRestaurant = async (data) => {
  return await axiosRestaurant.post('/restaurants', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateRestaurant = async (id, data) => {
  return await axiosRestaurant.patch(`/restaurants/${id}`, data);
};

export const deleteRestaurant = async (id) => {
  return await axiosRestaurant.delete(`/restaurants/${id}`);
};

export const uploadRestaurantPhoto = async (id, formData) => {
  return await axiosRestaurant.post(`/restaurants/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteRestaurantPhoto = async (id) => {
  return await axiosRestaurant.delete(`/restaurants/${id}/photo`);
};

export const createMenu = async (formData) => {
  return await axiosRestaurant.post(`/menu`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getMenus = async () => {
  return await axiosRestaurant.get('/menu');
};

export const getMenusByRestaurant = async (restaurantId) => {
  return await axiosRestaurant.get(`/menu/restaurant/${restaurantId}`);
};

export const updateMenu = async (id, formData) => {
  return await axiosRestaurant.put(`/menu/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteMenu = async (id) => {
  return await axiosRestaurant.delete(`/menu/${id}`);
};
