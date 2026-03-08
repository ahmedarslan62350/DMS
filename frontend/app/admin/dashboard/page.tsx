'use client';

import * as React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { motion } from 'motion/react';
import { Users, UserCheck, Building2, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminStats = [
  { label: 'Total Users', value: '42', icon: Users, trend: '+5%' },
  { label: 'Active Users', value: '38', icon: UserCheck, trend: '+2%' },
  { label: 'Total Companies', value: '128', icon: Building2, trend: '+4%' },
  { label: 'Total Logs', value: '12,450', icon: History, trend: '+12%' },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <div className="flex-1 p-8 flex flex-col gap-8">
          <header>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold tracking-tight mb-2"
            >
              Admin Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-black/40 dark:text-white/40 font-medium"
            >
              System-wide overview and administrative controls.
            </motion.p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl bg-white dark:bg-black border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 group-hover:bg-black dark:group-hover:bg-white transition-colors">
                    <stat.icon className="w-5 h-5 text-black/60 dark:text-white/60 group-hover:text-white dark:group-hover:text-black" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-emerald-500 bg-emerald-500/10">
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold tracking-tight mb-1">{stat.value}</h3>
                  <p className="text-sm text-black/40 dark:text-white/40 font-medium uppercase tracking-wider">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">System Performance</h2>
              <div className="space-y-6">
                {[
                  { label: 'CPU Usage', value: 45 },
                  { label: 'Memory Usage', value: 62 },
                  { label: 'Disk Space', value: 28 },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        className="h-full bg-black dark:bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Recent Admin Actions</h2>
              <div className="space-y-4">
                {[
                  { user: 'Admin', action: 'Created new user: Sarah K.', time: '10m ago' },
                  { user: 'Admin', action: 'Updated system permissions', time: '1h ago' },
                  { user: 'Admin', action: 'Deleted company: Old Corp', time: '3h ago' },
                ].map((action, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                    <div>
                      <p className="text-sm font-bold">{action.action}</p>
                      <p className="text-xs text-black/40 dark:text-white/40">{action.user}</p>
                    </div>
                    <span className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase">{action.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
