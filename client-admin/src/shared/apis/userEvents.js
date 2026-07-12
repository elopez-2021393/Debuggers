import { axiosRestaurant } from './api.js';

const BASE = '/events';

export const getPublicEventsByRestaurant = (restaurantId) =>
  axiosRestaurant.get(`${BASE}/restaurant/${restaurantId}`);

export const getAllPublicEvents = async (restaurants) => {
  const results = await Promise.allSettled(
    restaurants.map((r) => axiosRestaurant.get(`${BASE}/restaurant/${r._id}`))
  );
  return results.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value?.data?.data ?? []);
};

export const joinEvent = (id) => axiosRestaurant.post(`${BASE}/${id}/join`);

export const leaveEvent = (id) => axiosRestaurant.delete(`${BASE}/${id}/join`);

export const applyEvent = (id) => axiosRestaurant.post(`${BASE}/${id}/apply`);
