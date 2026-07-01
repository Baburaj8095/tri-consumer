import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '../constants/env';
import { clearAuth, getAccessToken, tryTokenRefresh } from '../services/authStorage';

const attachAuthInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshed = await tryTokenRefresh();
        if (refreshed) {
          const token = await getAccessToken();
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        }
        await clearAuth();
      }
      return Promise.reject(error);
    },
  );
};

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

export const captainClient = axios.create({
  baseURL: env.captainApiUrl,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

attachAuthInterceptor(apiClient);
attachAuthInterceptor(captainClient);