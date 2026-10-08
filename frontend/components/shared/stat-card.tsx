"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type TrendDirection = "up" | "down" | "neutral";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Small qualifier pinned to the value, e.g. a currency or unit. */
  suffix?: string;
  hint?: string;
  trend?: string;
  trendDirection?: TrendDirection;
  loading?: boolean;
  className?: string;
}

const trendTone: Record<TrendDirection, string> = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-muted-foreground",
};

/**
 * A metric is typography, not a UI widget.
 *
 * No icon-in-a-rounded-square, no hover lift, no tinted chip — the number
 * carries the weight and a single hairline separates it from its qualifier.
 */
export function StatCard({
  label,
  value,
  suffix,
  hint,
  trend,
  trendDirection = "neutral",
  loading = false,
  className,
}: Readonly<StatCardProps>) {
  if (loading) {
    return (
      <div className={cn("panel p-5", className)}>
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="mt-4 h-8 w-24" />
        <Skeleton className="mt-4 h-3 w-16" />
      </div>
    );
  }

  return (
    <div className={cn("panel p-5", className)}>
      <p className="micro-label">{label}</p>

      <p className="tnum mt-3.5 flex items-baseline gap-1.5 text-foreground">
        <span className="text-[1.75rem] leading-none font-semibold tracking-[-0.03em]">
          {value}
        </span>
        {suffix && (
          <span className="text-[13px] font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>

      {(hint || trend) && (
        <>
          <div className="rule mt-4" />
          <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
            <span className="truncate text-muted-foreground">
              {hint ?? ""}
            </span>
            {trend && (
              <span className={cn("font-medium", trendTone[trendDirection])}>
                {trend}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
