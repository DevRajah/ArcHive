import axios from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong."
): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const responseData = error.response?.data as
    | {
        message?: string;
        error?: string;
        details?: string;
      }
    | undefined;

  return (
    responseData?.message ||
    responseData?.error ||
    responseData?.details ||
    error.message ||
    fallback
  );
}