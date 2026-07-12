// client-user/src/shared/api/reportsClient.js

import axios from "axios";
import { ENDPOINTS } from "../constants/endpoints";
import { useAuthStore } from "../store/authStore";
import { attachRefreshInterceptor } from "./tokenRefresh";

const reportsClient = axios.create({
  baseURL: ENDPOINTS.REPORTS,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

reportsClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

attachRefreshInterceptor(reportsClient);

export default reportsClient;