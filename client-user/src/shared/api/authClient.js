// client-user/src/shared/api/authClient.js

import axios from "axios";
import { ENDPOINTS } from "../constants/endpoints";
import { useAuthStore } from "../store/authStore";
import { attachRefreshInterceptor } from "./tokenRefresh";

const authClient = axios.create({
  baseURL: ENDPOINTS.AUTH,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

authClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

attachRefreshInterceptor(authClient);

export default authClient;