import { apiClient } from "@/lib/axios";

export interface HealthResponse {
  status: "ok" | "degraded";
  database: {
    connected: boolean;
    state: string;
    name: string;
  };
  uptimeSeconds: number;
  timestamp: string;
  version: string;
  environment: string;
}

export class HealthApis {
  static async getHealth(): Promise<HealthResponse> {
    const { data } = await apiClient.get("/health");

    return data;
  }
}
