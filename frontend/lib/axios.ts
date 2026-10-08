import axios from "axios";
import { TokenStorage } from "./helpers";
import { env } from "@/config/env";

const serverUrl = env.SERVER_URL;

export const apiClient = axios.create({
  baseURL: `${serverUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = TokenStorage.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * A rejected token must end the session immediately, wherever it happens.
 *
 * Without this, an expired 12h JWT left the UI in a half-authenticated state:
 * every panel showed an error and the user had no way back to the sign-in
 * screen except a manual reload.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      TokenStorage.remove();

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  },
);

/** Pull a human-readable message out of whatever the API returned. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;

    if (data?.message) return data.message;

    if (error.code === "ERR_NETWORK") {
      return "Can't reach the API. Check that the backend is running and the server URL is correct.";
    }

    if (error.response?.status === 429) {
      return "Too many requests. Please wait a moment and try again.";
    }

    return error.message;
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong. Please try again.";
}
