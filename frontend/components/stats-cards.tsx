"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Building2, CheckCircle2, Calendar, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/hooks/useQueries";

export function StatsCards() {
  const { companies } = useCompanies() || [];

  const activeCompanies = companies.filter(
    (c: any) => c.status === "active",
  ).length;

  const totalServers = companies.reduce(
    (acc: number, c: any) => acc + (c.noOfServers || 0),
    0,
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const renewalsThisMonth = companies.filter((c: any) => {
    const renewalDate = new Date(c.renewalDate);
    return (
      renewalDate.getMonth() === currentMonth &&
      renewalDate.getFullYear() === currentYear
    );
  }).length;

  const stats = [
    {
      label: "Total Companies",
      value: companies.length,
      icon: Building2,
      trend: "+0%",
    },
    {
      label: "Active Companies",
      value: activeCompanies,
      icon: CheckCircle2,
      trend: "+Stable",
    },
    {
      label: "Renewals This Month",
      value: renewalsThisMonth.toString(),
      icon: Calendar,
      trend: "Upcoming",
    },
    {
      label: "Total Servers",
      value: totalServers.toString(),
      icon: Server,
      trend: "+18%",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
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
            <span
              className={cn(
                "text-xs font-bold px-2 py-1 rounded-full",
                stat.trend.startsWith("+")
                  ? "text-emerald-500 bg-emerald-500/10"
                  : "text-red-500 bg-red-500/10",
              )}
            >
              {stat.trend}
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold tracking-tight mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-black/40 dark:text-white/40 font-medium uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
