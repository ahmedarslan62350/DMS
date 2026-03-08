import { AuthApis } from "@/apis/auth.apis";
import { CompanyApis } from "@/apis/companies.api";
import { AdminUserApis } from "@/apis/adminUser.apis";
import { AdminRoleApis } from "@/apis/adminRole.apis";
import { AdminPermissionApis } from "@/apis/adminPermission.apis";
import { AuditApis } from "@/apis/auditLogs.api";

export class Queries {
  static currentUser() {
    return {
      queryKey: ["auth", "me"],
      queryFn: () => AuthApis.me(),
    };
  }

  static companies(page = 1, limit = 20) {
    return {
      queryKey: ["companies", page, limit],
      queryFn: () => CompanyApis.getCompanies(page, limit),
    };
  }

  static company(companyId: string) {
    return {
      queryKey: ["companies", companyId],
      queryFn: () => CompanyApis.getCompany(companyId),
    };
  }

  static users(page = 1, limit = 20) {
    return {
      queryKey: ["admin", "users", page, limit],
      queryFn: () => AdminUserApis.getUsers(page, limit),
    };
  }

  static user(userId: string) {
    return {
      queryKey: ["admin", "users", userId],
      queryFn: () => AdminUserApis.getUser(userId),
    };
  }

  static roles() {
    return {
      queryKey: ["admin", "roles"],
      queryFn: () => AdminRoleApis.getRoles(),
    };
  }

  static role(roleId: string) {
    return {
      queryKey: ["admin", "roles", roleId],
      queryFn: () => AdminRoleApis.getRole(roleId),
    };
  }

  static permissions() {
    return {
      queryKey: ["admin", "permissions"],
      queryFn: () => AdminPermissionApis.getPermissions(),
    };
  }

  static auditLogs(page = 1, limit = 50) {
    return {
      queryKey: ["auditLogs", page, limit],
      queryFn: () => AuditApis.getLogs(page, limit),
    };
  }
}
