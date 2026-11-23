import axios from 'axios';
import { API_URL } from '../config';
import storage from './storage';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token if available
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors and handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const message =
      error.response?.data?.message || error.message || 'Network request failed';

    // Log unauthorized events
    if (error.response?.status === 401) {
      console.warn('[API 401] Unauthorized access or expired token');
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
