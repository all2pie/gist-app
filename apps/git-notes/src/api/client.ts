import { useAuthStore } from '@/store';
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://api.github.com/',
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
});

// Add request interceptor to dynamically set Authorization header
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
