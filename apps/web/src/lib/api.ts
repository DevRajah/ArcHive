import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:6800/api",
  withCredentials: true,
});

// I keep auth handling here so every backend request uses one central setup.
api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = localStorage.getItem("archive_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});