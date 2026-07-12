// client-user/src/shared/api/tokenRefresh.js

import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { ENDPOINTS } from "../constants/endpoints";
import { useAuthStore } from "../store/authStore";


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

const NO_REFRESH_URLS = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/activate",
    "/auth/refresh",
];

export const attachRefreshInterceptor = (client) => {
    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (!originalRequest || originalRequest._retry) {
                return Promise.reject(error);
            }

            const status = error.response?.status;
            const data = error.response?.data;
            const url = originalRequest.url || "";

            const isNoRefreshUrl = NO_REFRESH_URLS.some((u) => url.includes(u));
            const errorCode = data?.error || data?.message;

            const shouldRefresh =
                !isNoRefreshUrl &&
                (status === 401 || (status === 403 && errorCode === "TOKEN_EXPIRED"));

            if (!shouldRefresh) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return client(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            let refreshToken = useAuthStore.getState().refreshToken;
            if (!refreshToken) {
                try {
                    refreshToken = await SecureStore.getItemAsync("dbe_refresh_token");
                } catch (e) {
                    refreshToken = null;
                }
            }

            if (!refreshToken) {
                isRefreshing = false;
                processQueue(error, null);
                await useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            try {
                // axios "pelado" (sin interceptores) para evitar recursión infinita
                const response = await axios.post(`${ENDPOINTS.AUTH}/auth/refresh`, {
                    refreshToken,
                });

                const payload = response.data.data || response.data;
                const newAccessToken = payload.accessToken || payload.token;
                const newRefreshToken = payload.refreshToken || refreshToken;
                const userDetails = payload.userDetails || payload.user;

                await useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

                if (userDetails) {
                    useAuthStore.getState().updateUser(userDetails);
                }

                processQueue(null, newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return client(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                await useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
    );
};