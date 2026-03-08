import { apiClient } from "../lib/axios";

export class AuditApis {
  static async getLogs(page = 1, limit = 20) {
    const { data: response } = await apiClient.get(
      `/audit?page=${page}&limit=${limit}`,
    );

    return response;
  }

  static async getEntityLogs(entityType: string, entityId: string) {
    const { data: response } = await apiClient.get(
      `/audit/${entityType}/${entityId}`,
    );

    return response;
  }
}
