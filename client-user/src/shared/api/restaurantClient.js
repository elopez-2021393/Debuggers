// client-user/src/shared/api/restaurantClient.js

import axios from "axios";
import { ENDPOINTS } from "../constants/endpoints";
import { useAuthStore } from "../store/authStore";
import { attachRefreshInterceptor } from "./tokenRefresh";

const restaurantClient = axios.create({
  baseURL: ENDPOINTS.RESTAURANT,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

restaurantClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

attachRefreshInterceptor(restaurantClient);

export default restaurantClient;