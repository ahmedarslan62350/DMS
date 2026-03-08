import { apiClient } from "@/lib/axios";

export class AdminUserApis {
  static async getUsers(page = 1, limit = 20) {
    const { data: response } = await apiClient.get(
      `/admin/users?page=${page}&limit=${limit}`,
    );

    return response;
  }

  static async getUser(userId: string) {
    const { data: response } = await apiClient.get(
      `/admin/users/${userId}`,
    );

    return response;
  }

  static async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    const { data: response } = await apiClient.post(
      `/admin/users`,
      data,
    );

    return response;
  }

  static async updateUser(
    userId: string,
    data: Partial<{
      name: string;
      email: string;
      password: string;
      role: string;
      status: "active" | "inactive";
    }>,
  ) {
    const { data: response } = await apiClient.put(
      `/admin/users/${userId}`,
      data,
    );

    return response;
  }

  static async deleteUser(userId: string) {
    const { data: response } = await apiClient.delete(
      `/admin/users/${userId}`,
    );

    return response;
  }
}
