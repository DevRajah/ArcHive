import axios from "axios";
import { getSession } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:6800/api";

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
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