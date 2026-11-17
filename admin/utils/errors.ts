import { isAxiosError } from "axios";

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

export const getErrorMessage = (error: unknown, fallback = DEFAULT_MESSAGE): string => {
  if (!isAxiosError<{ message?: string }>(error)) return fallback;

  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === "ERR_NETWORK") return "Cannot reach the server.";

  return fallback;
};
