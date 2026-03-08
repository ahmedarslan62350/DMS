'use client';

import * as React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { motion } from 'motion/react';
import { Save, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const permissions = [
  'Create Company',
  'Edit Company',
  'Delete Company',
  'View Logs',
  'Manage Users',
  'System Settings',
];

const users = [
  { id: 1, name: 'Ahmed Arslan', role: 'Admin' },
  { id: 2, name: 'Sarah Khan', role: 'Manager' },
  { id: 3, name: 'Mike Ross', role: 'Viewer' },
];

export default function PermissionsPage() {
  const [matrix, setMatrix] = React.useState<Record<string, boolean>>({});

  const togglePermission = (userId: number, perm: string) => {
    const key = `${userId}-${perm}`;
    setMatrix(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <div className="flex-1 p-8 flex flex-col gap-8">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Permissions Matrix</h1>
              <p className="text-black/40 dark:text-white/40 font-medium">
                Configure granular access control for all system users.
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Save className="w-5 h-5" /> Save Changes
            </button>
          </header>

          <div className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/[0.02] dark:bg-white/[0.02]">
                    <th className="px-6 py-6 border-r border-black/5 dark:border-white/10 min-w-[200px]">
                      <span className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40">User / Permission</span>
                    </th>
                    {permissions.map(perm => (
                      <th key={perm} className="px-6 py-6 text-center min-w-[140px]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 whitespace-nowrap">{perm}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id} className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-6 border-r border-black/5 dark:border-white/10">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{user.name}</span>
                          <span className="text-[10px] uppercase font-bold text-black/40 dark:text-white/40">{user.role}</span>
                        </div>
                      </td>
                      {permissions.map(perm => {
                        const isChecked = matrix[`${user.id}-${perm}`] || user.role === 'Admin';
                        return (
                          <td key={perm} className="px-6 py-6 text-center">
                            <button
                              onClick={() => user.role !== 'Admin' && togglePermission(user.id, perm)}
                              disabled={user.role === 'Admin'}
                              className={cn(
                                "w-10 h-6 rounded-full transition-all relative inline-flex items-center px-1",
                                isChecked ? "bg-black dark:bg-white" : "bg-black/10 dark:bg-white/10",
                                user.role === 'Admin' && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <motion.div
                                animate={{ x: isChecked ? 16 : 0 }}
                                className={cn(
                                  "w-4 h-4 rounded-full shadow-sm",
                                  isChecked ? "bg-white dark:bg-black" : "bg-white"
                                )}
                              />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
