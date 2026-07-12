import { axiosAuth } from './api.js';

export const login = async (data) => {
  return await axiosAuth.post('/auth/login', data);
};

export const register = async (data) => {
  return await axiosAuth.post('/auth/register', data);
};

export const activateAccount = async (token) => {
  return await axiosAuth.get(`/auth/activate/${token}`);
};

export const forgotPassword = async (email) => {
  return await axiosAuth.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token, newPassword) => {
  return await axiosAuth.post(`/auth/reset-password/${token}`, { newPassword });
};

export const getAllUsers = async () => {
  return await axiosAuth.get('/auth/users');
};

export const getUserById = async (id) => {
  return await axiosAuth.get(`/auth/users/${id}`);
};

export const createUser = async (data) => {
  return await axiosAuth.post('/auth', data);
};

export const toggleUserStatus = async (id) => {
  return await axiosAuth.patch(`/auth/users/${id}/status`);
};

export const updateProfile = async (data) => {
  return await axiosAuth.put('/auth/profile', data);
};

export const deleteUser = async (id) => {
  return await axiosAuth.delete(`/auth/users/${id}`);
};

export const verifyEmail = async (token) => {
  return await axiosAuth.get(`/auth/activate/${token}`);
};
