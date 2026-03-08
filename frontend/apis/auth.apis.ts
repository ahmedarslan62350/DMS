import { apiClient } from "../lib/axios";
import { TokenStorage } from "@/lib/helpers";

export class AuthApis {
  static async register(data: {
    name: string;
    email: string;
    password: string;
  }) {
    const { data: response } = await apiClient.post(`/auth/register`, data);
    return response;
  }

  static async login(data: { email: string; password: string }) {
    const { data: response } = await apiClient.post(`/auth/login`, data);
    TokenStorage.set(response?.token || "");
    return response;
  }

  static async me() {
    const { data: response } = await apiClient.get(`/auth/me`);

    return response;
  }
}
