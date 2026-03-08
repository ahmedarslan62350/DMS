import { apiClient } from "../lib/axios";

export class AdminPermissionApis {
  static async createPermission(data: any) {
    const { data: response } = await apiClient.post("/admin/permissions", data);

    return response;
  }

  static async getPermissions() {
    const { data: response } = await apiClient.get("/admin/permissions");

    return response;
  }

  static async deletePermission(permissionId: string) {
    const { data: response } = await apiClient.delete(
      `/admin/permissions/${permissionId}`,
    );

    return response;
  }
}
