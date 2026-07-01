"use client";

import * as React from "react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type TrendDirection = "up" | "down" | "neutral";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: TrendDirection;
  index?: number;
  loading?: boolean;
  className?: string;
}

const trendStyles: Record<TrendDirection, string> = {
  up: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
  down: "text-red-600 bg-red-500/10 dark:text-red-400",
  neutral: "text-muted-foreground bg-muted",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendDirection = "neutral",
  index = 0,
  loading = false,
  className,
}: Readonly<StatCardProps>) {
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-6 shadow-sm",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="mb-2 h-8 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
      whileHover={{ y: -3 }}
      className={cn(
        "group rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-muted p-2.5 transition-colors group-hover:bg-primary">
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground" />
        </div>
        {trend && (
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-semibold",
              trendStyles[trendDirection],
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="mb-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {value}
        </h3>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
      </div>
    </motion.div>
  );
}
