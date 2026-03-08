import { apiClient } from "../lib/axios";

export class CompanyApis {
  static async createCompany(data: {
    companyName: string;
    joiningDate: string;
    dialerLink: string;
    noOfServers: number;
    serverCharges: number;
    renewalDate: string;
  }) {
    const { data: response } = await apiClient.post("/companies", data);

    return response;
  }

  static async getCompanies(page = 1, limit = 20) {
    const { data: response } = await apiClient.get(
      `/companies?page=${page}&limit=${limit}`,
    );

    return response;
  }

  static async getCompany(companyId: string) {
    const { data: response } = await apiClient.get(`/companies/${companyId}`);

    return response;
  }

  static async updateCompany(
    companyId: string,
    data: Partial<{
      companyName: string;
      joiningDate: string;
      dialerLink: string;
      noOfServers: number;
      serverCharges: number;
      renewalDate: string;
      status: "active" | "inactive";
    }>,
  ) {
    const { data: response } = await apiClient.put(
      `/companies/${companyId}`,
      data,
    );

    return response;
  }

  static async deleteCompany(companyId: string) {
    const { data: response } = await apiClient.delete(
      `/companies/${companyId}`,
    );

    return response;
  }
}
