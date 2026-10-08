"use client";

import * as React from "react";
import { Check, ShieldCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Mutations } from "@/tanstack/Mutations/mutations";
import { Queries } from "@/tanstack/Queries/queries";

/** First non-empty string wins — the backend's populate is unreliable here. */
function firstLabel(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/**
 * `GET /admin/roles` populates permissions with `.populate("permissions",
 * "name description")`, but the Permission model's display field is `key` —
 * so the populated documents usually arrive without `name` at all. Reading
 * `key` first, then `name`, then `description`, keeps this working whichever
 * shape the API happens to return.
 */
function permissionLabel(permission: any): string {
  return (
    firstLabel(permission?.key, permission?.name, permission?.description) ??
    "Unnamed permission"
  );
}

function permissionDescription(permission: any): string | null {
  const label = firstLabel(
    permission?.key,
    permission?.name,
    permission?.description,
  );
  const description = firstLabel(permission?.description);

  return description && description !== label ? description : null;
}

function permissionId(permission: any): string | null {
  const raw =
    permission && typeof permission === "object"
      ? (permission._id ?? permission.id)
      : permission;

  return raw === null || raw === undefined || raw === "" ? null : String(raw);
}

/** Roles hold either raw ObjectIds or populated documents, depending on route. */
function permissionIdsOf(role: any): string[] {
  if (!Array.isArray(role?.permissions)) return [];

  return role.permissions
    .map((entry: any) => permissionId(entry))
    .filter((id: string | null): id is string => Boolean(id));
}

function capitalise(value: unknown): string {
  if (typeof value !== "string" || !value) return "Unnamed role";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface MatrixColumn {
  id: string;
  label: string;
  description: string | null;
}

export default function AdminPermissionsPage() {
  const queryClient = useQueryClient();

  const rolesQuery = useQuery(Queries.roles());
  const permissionsQuery = useQuery(Queries.permissions());

  const updateRole = useMutation(Mutations.updateRole(queryClient));

  const [overrides, setOverrides] = React.useState<
    Record<string, Record<string, boolean>>
  >({});
  const [pendingRole, setPendingRole] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  // Memoised so the derived matrices below keep stable dependency identities
  // instead of rebuilding on every render through a fresh `[]` fallback.
  const roles = React.useMemo(
    () => (rolesQuery.data as any[]) ?? [],
    [rolesQuery.data],
  );
  const permissions = React.useMemo(
    () => (permissionsQuery.data as any[]) ?? [],
    [permissionsQuery.data],
  );

  const isLoading = rolesQuery.isLoading || permissionsQuery.isLoading;
  const isError = rolesQuery.isError || permissionsQuery.isError;

  const refetchAll = React.useCallback(() => {
    void rolesQuery.refetch();
    void permissionsQuery.refetch();
  }, [rolesQuery, permissionsQuery]);

  // Only roles the API actually gave an id for can be written back to.
  const roleColumns = React.useMemo(
    () =>
      roles
        .filter((role: any) => Boolean(permissionId(role)))
        .map((role: any) => ({
          id: String(role._id),
          name: capitalise(role.name),
          description: firstLabel(role.description),
          granted: new Set(permissionIdsOf(role)),
        })),
    [roles],
  );

  const skippedRoles = roles.length - roleColumns.length;

  /**
   * Rows come from `GET /admin/permissions`. If that collection is empty but
   * the roles still carry populated permissions, the matrix is rebuilt from
   * whatever the roles reference rather than rendering nothing.
   */
  const columns = React.useMemo<MatrixColumn[]>(() => {
    const fromApi = permissions
      .map((permission: any) => {
        const id = permissionId(permission);
        if (!id) return null;

        return {
          id,
          label: permissionLabel(permission),
          description: permissionDescription(permission),
        };
      })
      .filter((column): column is MatrixColumn => Boolean(column));

    if (fromApi.length > 0) return fromApi;

    const seen = new Map<string, MatrixColumn>();
    roles.forEach((role: any) => {
      if (!Array.isArray(role?.permissions)) return;

      role.permissions.forEach((entry: any) => {
        const id = permissionId(entry);
        if (!id || seen.has(id)) return;

        seen.set(id, {
          id,
          label: permissionLabel(entry),
          description: permissionDescription(entry),
        });
      });
    });

    return Array.from(seen.values());
  }, [permissions, roles]);

  // Fresh server data supersedes any optimistic toggle still on screen.
  React.useEffect(() => {
    setOverrides({});
  }, [rolesQuery.data, permissionsQuery.data]);

  const isGranted = (roleId: string, columnId: string, granted: Set<string>) => {
    const override = overrides[roleId]?.[columnId];

    return override === undefined ? granted.has(columnId) : override;
  };

  /**
   * The payload is composed from the server's list *plus* every toggle still
   * held in `overrides`, not from the server's list alone. Without that, two
   * quick edits on one role would race: the second request would be built from
   * the pre-refetch list and silently undo the first.
   */
  const desiredPermissionIds = (
    roleId: string,
    granted: Set<string>,
    flip?: { columnId: string; value: boolean },
  ) => {
    const desired = new Set(granted);

    Object.entries(overrides[roleId] ?? {}).forEach(([columnId, value]) => {
      if (value) desired.add(columnId);
      else desired.delete(columnId);
    });

    if (flip) {
      if (flip.value) desired.add(flip.columnId);
      else desired.delete(flip.columnId);
    }

    return Array.from(desired);
  };

  const handleToggle = (
    roleId: string,
    roleName: string,
    column: MatrixColumn,
    granted: Set<string>,
  ) => {
    const next = !isGranted(roleId, column.id, granted);

    setActionError(null);
    setPendingRole(roleId);
    setOverrides((prev) => ({
      ...prev,
      [roleId]: { ...prev[roleId], [column.id]: next },
    }));

    updateRole.mutate(
      {
        id: roleId,
        data: {
          permissions: desiredPermissionIds(roleId, granted, {
            columnId: column.id,
            value: next,
          }),
        },
      },
      {
        onError: (error) => {
          setActionError(
            `Couldn't update ${roleName}: ${getApiErrorMessage(error)}`,
          );
          // Drop the optimistic flip so the cell shows the server's truth.
          setOverrides((prev) => {
            const roleOverrides = { ...prev[roleId] };
            delete roleOverrides[column.id];

            return { ...prev, [roleId]: roleOverrides };
          });
        },
        onSettled: () => setPendingRole(null),
      },
    );
  };

  // Counted through the override-aware helper so the header agrees with the
  // cells the moment a box is ticked, before the refetch returns.
  const grantedTotal = roleColumns.reduce(
    (sum, role) => sum + desiredPermissionIds(role.id, role.granted).length,
    0,
  );

  return (
    <AppShell
      title="Roles & permissions"
      description="Which capability each role holds. Toggling a cell writes to the role immediately — there is no separate save step."
    >
      <div className="panel overflow-hidden rounded-md">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border px-4 py-3">
          <p className="micro-label">Permission matrix</p>
          {!isLoading && !isError && roleColumns.length > 0 && (
            <p className="tnum text-[11px] text-muted-foreground">
              {roleColumns.length}{" "}
              {roleColumns.length === 1 ? "role" : "roles"}
              <span className="mx-1.5 text-border-strong">·</span>
              {columns.length}{" "}
              {columns.length === 1 ? "permission" : "permissions"}
              <span className="mx-1.5 text-border-strong">·</span>
              {grantedTotal} granted
            </p>
          )}
        </div>

        {actionError && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 border-b border-destructive/25 bg-destructive/8 px-4 py-2.5"
          >
            <p className="body-sm text-destructive">{actionError}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActionError(null)}
              aria-label="Dismiss error"
            >
              Dismiss
            </Button>
          </div>
        )}

        {skippedRoles > 0 && (
          <p className="body-sm border-b border-border bg-surface-alt px-4 py-2.5 text-muted-foreground">
            {skippedRoles}{" "}
            {skippedRoles === 1 ? "role was" : "roles were"} returned without an
            id and cannot be edited here.
          </p>
        )}

        {isError ? (
          <ErrorState
            title="Couldn't load roles and permissions"
            description="There was a problem fetching the access-control data. Please try again."
            onRetry={refetchAll}
          />
        ) : isLoading ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Permission</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableSkeleton rows={8} columns={3} />
            </TableBody>
          </Table>
        ) : roleColumns.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No roles are defined"
            description="Roles and their permissions are managed by an administrator. Once a role exists, its capabilities appear here as a matrix you can toggle."
          />
        ) : columns.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No permissions are defined"
            description="No permission keys were returned by the API, so there is nothing to grant. An administrator has to seed the permission catalogue first."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[240px]">Permission</TableHead>
                {roleColumns.map((role) => (
                  <TableHead
                    key={role.id}
                    className="min-w-[140px]"
                    title={role.description ?? undefined}
                  >
                    <span className="block text-foreground">{role.name}</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {columns.map((column, index) => (
                <TableRow
                  key={column.id}
                  className={cn(index % 2 === 1 && "bg-surface-alt")}
                >
                  <TableCell>
                    <p className="font-mono text-[12px] font-medium text-foreground">
                      {column.label}
                    </p>
                    {column.description && (
                      <p className="body-sm mt-0.5 text-muted-foreground">
                        {column.description}
                      </p>
                    )}
                  </TableCell>

                  {roleColumns.map((role) => {
                    const checked = isGranted(role.id, column.id, role.granted);
                    const cellKey = `${role.id}:${column.id}`;
                    // Every cell in a role's column waits for that role's write
                    // to land, so two edits can never interleave.
                    const isPending = pendingRole === role.id;

                    return (
                      <TableCell key={cellKey}>
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          aria-label={`${checked ? "Revoke" : "Grant"} ${column.label} for the ${role.name} role`}
                          disabled={isPending}
                          onClick={() =>
                            handleToggle(role.id, role.name, column, role.granted)
                          }
                          className={cn(
                            "inline-flex size-5 items-center justify-center rounded-[3px] border transition-colors duration-150",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                            "disabled:cursor-wait disabled:opacity-50",
                            checked
                              ? "border-primary bg-primary text-primary-foreground hover:bg-primary-hover"
                              : "border-border bg-surface text-transparent hover:border-border-strong hover:bg-muted",
                          )}
                        >
                          {checked && (
                            <Check className="size-3" aria-hidden="true" />
                          )}
                        </button>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!isLoading && !isError && roleColumns.length > 0 && columns.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border px-4 py-3">
            <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex size-5 items-center justify-center rounded-[3px] border border-primary bg-primary text-primary-foreground">
                <Check className="size-3" aria-hidden="true" />
              </span>
              Granted
            </span>
            <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-block size-5 rounded-[3px] border border-border bg-surface" />
              Not granted
            </span>
            {updateRole.isPending && (
              <Badge variant="secondary">Saving…</Badge>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
