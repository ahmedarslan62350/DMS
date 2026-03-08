'use client';

import * as React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { motion } from 'motion/react';
import { Search, Filter, Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const auditLogs = [
  { id: 1, user: 'Ahmed Arslan', action: 'Created User', target: 'Sarah Khan', field: 'Role', old: 'None', new: 'Manager', time: '2024-03-06 10:45 AM' },
  { id: 2, user: 'Admin', action: 'Updated Permission', target: 'Mike Ross', field: 'View Logs', old: 'False', new: 'True', time: '2024-03-06 09:12 AM' },
  { id: 3, user: 'Sarah Khan', action: 'Deleted Company', target: 'Old Corp', field: 'Status', old: 'Active', new: 'Deleted', time: '2024-03-05 04:15 PM' },
  { id: 4, user: 'Admin', action: 'System Update', target: 'Global Settings', field: 'Maintenance Mode', old: 'Off', new: 'On', time: '2024-03-05 11:30 AM' },
];

export default function AuditLogsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
          <header className="flex flex-wrap items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">System Activity Logs</h1>
              <p className="text-black/40 dark:text-white/40 font-medium">
                Comprehensive audit trail of all administrative actions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
                <input type="text" placeholder="Search logs..." className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all" />
              </div>
              <button className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="relative space-y-8">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-black/5 dark:bg-white/10" />
            
            {auditLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-12 group"
              >
                <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-black dark:border-white z-10 group-hover:scale-125 transition-transform" />
                
                <div className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center font-bold text-[10px]">
                        {log.user.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{log.user}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">{log.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {log.time}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-black/40 dark:text-white/40 uppercase tracking-wider">Target:</span>
                      <span className="text-xs font-bold">{log.target}</span>
                      <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/5">{log.field}</span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex-1 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                        <p className="text-[10px] uppercase font-bold text-black/40 dark:text-white/40 mb-1">Old Value</p>
                        <p className="text-sm font-medium opacity-50">{log.old}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-black/20 dark:text-white/20 shrink-0" />
                      <div className="flex-1 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                        <p className="text-[10px] uppercase font-bold text-black/40 dark:text-white/40 mb-1">New Value</p>
                        <p className="text-sm font-bold text-emerald-500">{log.new}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
