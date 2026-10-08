"use client";

import * as React from "react";
import { Pencil, Power, Trash2, UserPlus, Users as UsersIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRoles, useUsers } from "@/hooks/useQueries";
import { getApiErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Mutations } from "@/tanstack/Mutations/mutations";

type UserStatus = "active" | "inactive";

interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: string;
  status: UserStatus;
}

const EMPTY_FORM: UserFormState = {
  name: "",
  email: "",
  password: "",
  role: "",
  status: "active",
};

function capitalise(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function readRoleName(user: any): string {
  const role = user?.role;
  if (role && typeof role === "object") return role.name ?? "—";
  return typeof role === "string" ? role : "—";
}

function readRoleId(user: any): string {
  const role = user?.role;
  if (role && typeof role === "object") return role._id ?? "";
  return typeof role === "string" ? role : "";
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const { users, isLoading, isError, refetch } = useUsers();
  const { roles, isLoading: rolesLoading } = useRoles();

  const createUser = useMutation(Mutations.createUser(queryClient));
  const updateUser = useMutation(Mutations.updateUser(queryClient));
  const deleteUser = useMutation(Mutations.deleteUser(queryClient));

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<UserFormState>(EMPTY_FORM);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<any | null>(null);
  const [rowError, setRowError] = React.useState<string | null>(null);

  const rows = (users as any[]) ?? [];
  const roleOptions = ((roles as any[]) ?? []).map((role: any) => ({
    id: String(role._id),
    name: typeof role.name === "string" ? role.name : "unnamed",
  }));

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, role: roleOptions[0]?.id ?? "" });
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (user: any) => {
    setEditingId(String(user._id));
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      password: "",
      role: readRoleId(user),
      status: (user.status as UserStatus) ?? "active",
    });
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (editingId) {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
      };

      // An untouched password field must not overwrite the stored hash.
      if (form.password.trim()) payload.password = form.password;

      updateUser.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => closeForm(),
          onError: (error) => setFormError(getApiErrorMessage(error)),
        },
      );
      return;
    }

    createUser.mutate(
      {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      },
      {
        onSuccess: () => closeForm(),
        onError: (error) => setFormError(getApiErrorMessage(error)),
      },
    );
  };

  const handleToggleStatus = (user: any) => {
    setRowError(null);
    const next: UserStatus = user.status === "active" ? "inactive" : "active";

    updateUser.mutate(
      { id: String(user._id), data: { status: next } },
      { onError: (error) => setRowError(getApiErrorMessage(error)) },
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    deleteUser.mutate(String(deleteTarget._id), {
      onSuccess: () => setDeleteTarget(null),
      onError: (error) => {
        setRowError(getApiErrorMessage(error));
        setDeleteTarget(null);
      },
    });
  };

  const isSaving = createUser.isPending || updateUser.isPending;

  return (
    <AppShell
      title="Users"
      description="Accounts that can sign in to the portal. Create, edit, reassign roles and revoke access."
      actions={
        <Button onClick={openCreate} disabled={roleOptions.length === 0}>
          <UserPlus className="size-4" />
          Create user
        </Button>
      }
    >
      <div className="panel overflow-hidden rounded-md">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border px-4 py-3">
          <p className="micro-label">Accounts</p>
          {!isLoading && !isError && (
            <p className="tnum text-[11px] text-muted-foreground">
              {rows.length} {rows.length === 1 ? "user" : "users"}
            </p>
          )}
        </div>

        {rowError && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 border-b border-destructive/25 bg-destructive/8 px-4 py-2.5"
          >
            <p className="body-sm text-destructive">{rowError}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowError(null)}
              aria-label="Dismiss error"
            >
              Dismiss
            </Button>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[130px]">Role</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={6} columns={5} />
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="whitespace-normal p-0">
                  <ErrorState
                    title="Couldn't load users"
                    description="There was a problem fetching the user list. Please try again."
                    onRetry={() => void refetch()}
                  />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="whitespace-normal p-0">
                  <EmptyState
                    icon={UsersIcon}
                    title="No users yet"
                    description={
                      roleOptions.length === 0
                        ? "A role has to exist before an account can be created. Ask an administrator to set one up."
                        : "Create the first account to start granting access to the portal."
                    }
                    action={
                      roleOptions.length > 0 ? (
                        <Button size="sm" onClick={openCreate}>
                          Create user
                        </Button>
                      ) : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((user: any, index: number) => {
                const name = user.name ?? "—";
                const status: UserStatus =
                  user.status === "inactive" ? "inactive" : "active";

                return (
                  <TableRow
                    key={String(user._id)}
                    className={cn(index % 2 === 1 && "bg-surface-alt")}
                  >
                    <TableCell>
                      <p className="truncate font-medium text-foreground">
                        {name}
                      </p>
                      <p className="mono-id mt-0.5 truncate text-muted-foreground">
                        {String(user._id ?? "")}
                      </p>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      <span className="truncate" title={user.email ?? ""}>
                        {user.email ?? "—"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{readRoleName(user)}</Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={status === "active" ? "success" : "neutral"}>
                        {capitalise(status)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(user)}
                          aria-label={`Edit ${name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleToggleStatus(user)}
                          disabled={updateUser.isPending}
                          aria-label={
                            status === "active"
                              ? `Deactivate ${name}`
                              : `Activate ${name}`
                          }
                        >
                          <Power className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="hover:text-destructive"
                          onClick={() => setDeleteTarget(user)}
                          aria-label={`Delete ${name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / edit */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => (open ? setFormOpen(true) : closeForm())}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit user" : "Create user"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the account details, role or access status."
                : "The account is active immediately and can sign in with this password."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate={false}>
            <DialogBody className="space-y-4">
              {formError && (
                <p role="alert" className="body-sm text-destructive">
                  {formError}
                </p>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="user-name">Full name</Label>
                <Input
                  id="user-name"
                  name="name"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user-email">Email address</Label>
                <Input
                  id="user-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user-password">
                  {editingId ? "New password" : "Password"}
                </Label>
                <Input
                  id="user-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required={!editingId}
                  placeholder={
                    editingId ? "Leave blank to keep the current password" : ""
                  }
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user-role">Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, role: value }))
                  }
                  disabled={rolesLoading || roleOptions.length === 0}
                >
                  <SelectTrigger id="user-role" className="w-full">
                    <SelectValue
                      placeholder={
                        roleOptions.length === 0
                          ? "No roles available"
                          : "Select a role"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {capitalise(role.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editingId && (
                <div className="space-y-1.5">
                  <Label htmlFor="user-status">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        status: value as UserStatus,
                      }))
                    }
                  >
                    <SelectTrigger id="user-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !form.role || roleOptions.length === 0}
              >
                {isSaving
                  ? "Saving…"
                  : editingId
                    ? "Save changes"
                    : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              This permanently removes{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name ?? "this user"}
              </span>{" "}
              and their access to the portal. Audit history is preserved. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="solidDestructive"
              disabled={deleteUser.isPending}
              onClick={confirmDelete}
            >
              {deleteUser.isPending ? "Deleting…" : "Delete user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
