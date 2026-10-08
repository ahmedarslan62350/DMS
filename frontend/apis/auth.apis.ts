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

    // Only persist a real token — storing "" produced a bogus "authenticated"
    // state that made every subsequent request 401.
    if (response?.token) {
      TokenStorage.set(response.token);
    }

    return response;
  }

  static async me() {
    const { data: response } = await apiClient.get(`/auth/me`);

    return response;
  }
}
