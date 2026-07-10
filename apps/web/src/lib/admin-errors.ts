import axios from "axios";

export function getAdminErrorStatus(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null;

  return error.response?.status ?? null;
}

export function isAdminUnauthorized(error: unknown) {
  return getAdminErrorStatus(error) === 401;
}

export function isAdminForbidden(error: unknown) {
  return getAdminErrorStatus(error) === 403;
}