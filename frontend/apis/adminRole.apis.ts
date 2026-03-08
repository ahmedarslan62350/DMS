import { apiClient } from "../lib/axios";

export class AdminRoleApis {
  static async createRole(data: any) {
    const { data: response } = await apiClient.post("/admin/roles", data);

    return response;
  }

  static async getRoles() {
    const { data: response } = await apiClient.get("/admin/roles");

    return response;
  }

  static async getRole(roleId: string) {
    const { data: response } = await apiClient.get(`/admin/roles/${roleId}`);

    return response;
  }

  static async updateRole(roleId: string, data: any) {
    const { data: response } = await apiClient.put(
      `/admin/roles/${roleId}`,
      data,
    );

    return response;
  }

  static async deleteRole(roleId: string) {
    const { data: response } = await apiClient.delete(`/admin/roles/${roleId}`);

    return response;
  }
}
