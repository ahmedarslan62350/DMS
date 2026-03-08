import { QueryClient } from "@tanstack/react-query";
import { MutationFactory } from "./mutationFactory";

import { CompanyApis } from "@/apis/companies.api";
import { AdminUserApis } from "@/apis/adminUser.apis";
import { AdminRoleApis } from "@/apis/adminRole.apis";
import { AdminPermissionApis } from "@/apis/adminPermission.apis";

export class Mutations {
  static createCompany(queryClient: QueryClient) {
    return MutationFactory.createMutation({
      queryClient,
      mutationFn: (data: any) => CompanyApis.createCompany(data),
      invalidateKeys: [["companies"]],
    });
  }

  static updateCompany(queryClient: QueryClient) {
    return MutationFactory.createMutation({
      queryClient,
      mutationFn: ({ id, data }: any) => CompanyApis.updateCompany(id, data),
      invalidateKeys: [["companies"]],
    });
  }

  static deleteCompany(queryClient: QueryClient) {
    return MutationFactory.createMutation({
      queryClient,
      mutationFn: (id: string) => CompanyApis.deleteCompany(id),
      invalidateKeys: [["companies"]],
    });
  }

  static createUser(queryClient: QueryClient) {
    return MutationFactory.createMutation({
      queryClient,
      mutationFn: (data: any) => AdminUserApis.createUser(data),
      invalidateKeys: [["admin", "users"]],
    });
  }

  static updateUser(queryClient: QueryClient) {
    return MutationFactory.createMutation({
      queryClient,
      mutationFn: ({ id, data }: any) => AdminUserApis.updateUser(id, data),
      invalidateKeys: [["admin", "users"]],
    });
  }

  static deleteUser(queryClient: QueryClient) {
    return MutationFactory.createMutation({
      queryClient,
      mutationFn: (id: string) => AdminUserApis.deleteUser(id),
      invalidateKeys: [["admin", "users"]],
    });
  }

  static createRole(queryClient: QueryClient) {
    return MutationFactory.createMutation({
      queryClient,
      mutationFn: (data: any) => AdminRoleApis.createRole(data),
      invalidateKeys: [["admin", "roles"]],
    });
  }

  static updateRole(queryClient: QueryClient) {
    return MutationFactory.createMutation({
      queryClient,
      mutationFn: ({ id, data }: any) => AdminRoleApis.updateRole(id, data),
      invalidateKeys: [["admin", "roles"]],
    });
  }

  static deleteRole(queryClient: QueryClient) {
    return MutationFactory.createMutation({
      queryClient,
      mutationFn: (id: string) => AdminRoleApis.deleteRole(id),
      invalidateKeys: [["admin", "roles"]],
    });
  }

  static createPermission(queryClient: QueryClient) {
    return MutationFactory.createMutation({
      queryClient,
      mutationFn: (data: { key: string; description: string }) =>
        AdminPermissionApis.createPermission(data),
      invalidateKeys: [["admin", "roles"]],
    });
  }
  static deletePermission(queryClient: QueryClient) {
    return MutationFactory.createMutation({
      queryClient,
      mutationFn: (id: string) => AdminPermissionApis.deletePermission(id),
      invalidateKeys: [["admin", "roles"]],
    });
  }
}
