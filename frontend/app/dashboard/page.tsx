"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { StatsCards } from "@/components/stats-cards";
import { RightPanel } from "@/components/right-panel";
import { PageHeader } from "@/components/shared/page-header";
import { motion } from "motion/react";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <div className="flex flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:flex-row lg:p-8">
          <div className="flex min-w-0 flex-1 flex-col gap-6 sm:gap-8">
            <PageHeader
              title="Dashboard Overview"
              description="Key metrics and upcoming renewals at a glance."
            />

            <StatsCards />

            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold mb-4">System Health</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                    <span className="text-sm font-medium">API Status</span>
                    <span className="text-xs font-bold text-emerald-500 uppercase">
                      Operational
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                    <span className="text-sm font-medium">
                      Database Latency
                    </span>
                    <span className="text-xs font-bold text-emerald-500 uppercase">
                      12ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                    <span className="text-sm font-medium">Server Load</span>
                    <span className="text-xs font-bold text-emerald-500 uppercase">
                      24%
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button className="p-4 rounded-xl border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm font-bold">
                    Add Company
                  </button>

                  <button className="p-4 rounded-xl border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm font-bold">
                    View Logs
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          <RightPanel />
        </div>
      </main>
    </div>
  );
}
