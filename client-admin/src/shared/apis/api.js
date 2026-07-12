import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/authStore.js';

//Crear instancias de axios para cada servicio
const axiosAuth = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosRestaurant = axios.create({
  baseURL: import.meta.env.VITE_RESTAURANT_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosReports = axios.create({
  baseURL: import.meta.env.VITE_REPORTS_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

//INTERCEPTORES DE TOKENS
axiosAuth.interceptors.request.use((config) => {
  config._axiosClient = 'auth';
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosRestaurant.interceptors.request.use((config) => {
  config._axiosClient = 'restaurant';
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosReports.interceptors.request.use((config) => {
  config._axiosClient = 'reports';
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let _isRefreshing = false;
let failedQueue = [];

function _processQueue(_error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => (_error ? reject(_error) : resolve(token)));
  failedQueue = [];
}

const handleRefreshToken = async function (_error) {
  const _original = _error.config;
  if (!_original || _original._retry) {
    return Promise.reject(_error);
  }
  const status = _error.response?.status;
  const errorCode = _error.response?.data?.error;
  const isRefreshEndpoint = (_original.url || '').includes('/auth/refresh');
  const shouldAttemptRefresh = !isRefreshEndpoint && status === 401;

  const shouldAttemptRefreshFrom403 =
    !isRefreshEndpoint && status === 403 && errorCode === 'TOKEN_EXPIRED';

  const shouldRefresh = shouldAttemptRefresh || shouldAttemptRefreshFrom403;

  if (shouldRefresh) {
    const retryClient = _original._axiosClient === 'restaurant' ? axiosRestaurant : axiosAuth;
    if (_isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          _original.headers['Authorization'] = 'Bearer ' + token;
          return retryClient(_original);
        })
        .catch((err) => Promise.reject(err));
    }
    _original._retry = true;
    _isRefreshing = true;
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      useAuthStore.getState().logout();
      return Promise.reject(_error);
    }
    try {
      const response = await axiosAuth.post('/auth/refresh', { refreshToken });
      const payload = response.data.data ?? response.data;
      const { accessToken, refreshToken: newRefreshToken, expiresIn, userDetails } = payload;
      useAuthStore.setState({
        token: accessToken,
        refreshToken: newRefreshToken,
        expiresAt: expiresIn,
        user: userDetails || useAuthStore.getState().user,
        isAuthenticated: true,
      });
      _processQueue(null, accessToken);
      _original.headers['Authorization'] = 'Bearer ' + accessToken;
      return retryClient(_original);
    } catch (err) {
      _processQueue(err, null);
      useAuthStore.getState().logout();
      return Promise.reject(err);
    } finally {
      _isRefreshing = false;
    }
  }
  return Promise.reject(_error);
};

axiosAuth.interceptors.response.use((res) => res, handleRefreshToken);
axiosRestaurant.interceptors.response.use((res) => res, handleRefreshToken);
axiosReports.interceptors.response.use((res) => res, handleRefreshToken);

export { axiosAuth, axiosRestaurant, axiosReports };
export { handleRefreshToken }; //ojala funcione o lloro