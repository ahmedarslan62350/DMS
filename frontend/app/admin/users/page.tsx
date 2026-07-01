"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import {
  UserPlus,
  Edit2,
  Trash2,
  Slash,
  Shield,
  Mail,
  Lock,
  Users as UsersIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoles, useUsers } from "@/hooks/useQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mutations } from "@/tanstack/Mutations/mutations";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ColumnResizeHandle,
  useResizableColumns,
  type ResizableColumnDef,
} from "@/components/ui/resizable-table";

const COLUMNS: (ResizableColumnDef & { label: string; align?: "right" })[] = [
  { id: "name", width: 220, minWidth: 160, label: "User Name" },
  { id: "email", width: 230, minWidth: 160, label: "Email" },
  { id: "role", width: 130, minWidth: 100, label: "Role" },
  { id: "status", width: 120, minWidth: 90, label: "Status" },
  { id: "permissions", width: 140, minWidth: 100, label: "Permissions" },
  { id: "actions", width: 120, minWidth: 100, maxWidth: 160, label: "Actions", align: "right" },
];

export default function ManageUsersPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { users: usersData, isLoading, isError, refetch } = useUsers();
  const { roles: rolesData } = useRoles();
  const queryClient = useQueryClient();
  const createUserMutation = useMutation(Mutations.createUser(queryClient));

  const { widths, startResize, nudgeColumn, resetColumn } =
    useResizableColumns(COLUMNS);

  const users = (usersData || []).map((u: any) => {
    const getPermissionLabel = (roleName: string) => {
      switch (roleName?.toLowerCase()) {
        case "admin":
          return "Full Access";
        case "manager":
          return "Limited";
        default:
          return "Read Only";
      }
    };

    return {
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role?.name
        ? u.role.name.charAt(0).toUpperCase() + u.role.name.slice(1)
        : "N/A",
      status: u.status
        ? u.status.charAt(0).toUpperCase() + u.status.slice(1)
        : "Inactive",
      permissions: getPermissionLabel(u.role?.name),
    };
  });

  const roles = rolesData.map((r: any) => ({ value: r._id, name: r.name }));

  const onSubmit = (e: any) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const role = e.target.role.value;

    createUserMutation.mutate({
      name,
      email,
      password,
      role,
    });

    if (createUserMutation.isSuccess) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8">
          <PageHeader
            title="User Management"
            description="Manage system users, roles, and access levels."
            actions={
              <Button onClick={() => setIsModalOpen(true)}>
                <UserPlus className="h-4 w-4" /> Create User
              </Button>
            }
          />

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Table className="w-max min-w-full table-fixed">
              <colgroup>
                {COLUMNS.map((col) => (
                  <col key={col.id} style={{ width: widths[col.id] }} />
                ))}
              </colgroup>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {COLUMNS.map((col) => (
                    <TableHead
                      key={col.id}
                      className={col.align === "right" ? "text-right" : undefined}
                    >
                      {col.label}
                      <ColumnResizeHandle
                        columnLabel={col.label}
                        width={widths[col.id]}
                        minWidth={col.minWidth}
                        maxWidth={col.maxWidth}
                        onPointerDown={startResize(col.id)}
                        onNudge={(direction) => nudgeColumn(col.id, direction)}
                        onReset={() => resetColumn(col.id)}
                      />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton rows={5} columns={COLUMNS.length} />
                ) : isError ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={COLUMNS.length} className="whitespace-normal">
                      <ErrorState
                        title="Couldn't load users"
                        description="There was a problem fetching the user list. Please try again."
                        onRetry={refetch}
                      />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={COLUMNS.length} className="whitespace-normal">
                      <EmptyState
                        icon={UsersIcon}
                        title="No users yet"
                        description="Create your first user to start managing access to the portal."
                        action={
                          <Button size="sm" onClick={() => setIsModalOpen(true)}>
                            Create User
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: any) => (
                    <TableRow key={user.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <span className="truncate text-sm font-semibold">
                            {user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "Admin"
                              ? "destructive"
                              : user.role === "Manager"
                                ? "default"
                                : "neutral"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "Active" ? "success" : "neutral"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.permissions}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${user.name}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="hover:text-destructive"
                            aria-label={`Deactivate ${user.name}`}
                          >
                            <Slash className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="hover:text-destructive"
                            aria-label={`Delete ${user.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user and assign their role and access level.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit}>
            <DialogBody className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="user-name">
                  <Shield className="h-3 w-3" /> Full Name
                </Label>
                <Input
                  id="user-name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="user-email">
                  <Mail className="h-3 w-3" /> Email Address
                </Label>
                <Input
                  id="user-email"
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="user-password">
                  <Lock className="h-3 w-3" /> Password
                </Label>
                <Input
                  id="user-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="user-role">Role</Label>
                <select
                  id="user-role"
                  name="role"
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  {roles.map((r: any) => (
                    <option value={r.value} key={r.value}>
                      {r?.name}
                    </option>
                  ))}
                </select>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
