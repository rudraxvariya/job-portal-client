import axios from "axios";
import { AUTH_TOKEN_STORAGE_KEY } from "../constants/auth";

const baseURL = import.meta.env.VITE_API_URL || "/api/v1";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: false, // using Authorization header instead of cookies
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
