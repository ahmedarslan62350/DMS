import { apiClient } from "../lib/axios";

export class AuditApis {
  static async getLogs(page = 1, limit = 20) {
    const { data: response } = await apiClient.get(
      `/audit?page=${page}&limit=${limit}`,
    );

    return response;
  }

  static async getEntityLogs(
    entityType: string,
    entityId: string,
    idx = 0,
  ) {
    const { data: response } = await apiClient.get(
      `/audit/${entityType}/${entityId}/${idx}`,
    );

    return response;
  }

  static async getFieldLogs(
    entityType: string,
    entityId: string,
    field: string,
    page = 1,
  ) {
    const { data: response } = await apiClient.get(
      `/audit/${entityType}/${entityId}/field/${field}?page=${page}`,
    );

    return response;
  }
}