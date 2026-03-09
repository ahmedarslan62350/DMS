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
