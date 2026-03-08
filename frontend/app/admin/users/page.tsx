"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { motion, AnimatePresence } from "motion/react";
import {
  UserPlus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Slash,
  X,
  Shield,
  Mail,
  Lock,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoles, useUsers } from "@/hooks/useQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mutations } from "@/tanstack/Mutations/mutations";

export default function ManageUsersPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { users: usersData } = useUsers();
  const { roles: rolesData } = useRoles();
  const queryClient = useQueryClient();
  const createUserMutation = useMutation(Mutations.createUser(queryClient));

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
      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <div className="flex-1 p-8 flex flex-col gap-8">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                User Management
              </h1>
              <p className="text-black/40 dark:text-white/40 font-medium">
                Manage system users, roles, and access levels.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <UserPlus className="w-5 h-5" /> Create User
            </button>
          </header>

          <div className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
                    <th className="px-6 py-4">User Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Permissions</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/10">
                  {users.map((user: any) => (
                    <tr
                      key={user.id}
                      className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center font-bold text-xs">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-bold text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-black/60 dark:text-white/60">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            user.role === "Admin"
                              ? "bg-red-500/10 text-red-500"
                              : user.role === "Manager"
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40",
                          )}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
                            user.status === "Active"
                              ? "text-emerald-500"
                              : "text-red-500",
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              user.status === "Active"
                                ? "bg-emerald-500"
                                : "bg-red-500",
                            )}
                          />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-black/60 dark:text-white/60">
                        {user.permissions}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black/40 dark:text-white/40 hover:text-red-500">
                            <Slash className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black/40 dark:text-white/40 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Create User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed scale-75 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl z-[60] overflow-hidden"
            >
              <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">
                  Create New User
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={onSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 flex items-center gap-2">
                      <Shield className="w-3 h-3" /> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 flex items-center gap-2">
                      <Lock className="w-3 h-3" /> Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40">
                      Role
                    </label>
                    <select
                      name="role"
                      className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    >
                      {roles.map((r: any) => (
                        <option value={r.value} key={r.value}>
                          {r?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* 
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40">
                    Permissions
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Create Company",
                      "Edit Company",
                      "Delete Company",
                      "View Logs",
                      "Manage Users",
                    ].map((perm) => (
                      <label
                        key={perm}
                        className="flex items-center gap-3 p-3 rounded-xl border border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-black/20 dark:border-white/20 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                        />
                        <span className="text-xs font-medium">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div> */}

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
