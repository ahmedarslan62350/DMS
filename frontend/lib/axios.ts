import axios from "axios";
import { TokenStorage } from "./helpers";

const serverUrl = "http://localhost:5000";

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
