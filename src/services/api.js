// src/services/api.js
import axios from "axios";

const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';

const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (runtimeOrigin ? `${runtimeOrigin}/api` : '/api');

const normalizedBaseUrl = /\/api\/?$/.test(rawBaseUrl)
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/+$/, "")}/api`;

const api = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;