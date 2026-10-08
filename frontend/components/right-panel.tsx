"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanies, useLogs } from "@/hooks/useQueries";
import {
  daysUntil,
  formatAuditValue,
  formatDate,
  isImpField,
} from "@/lib/helpers";

const MAX_RENEWALS = 6;
const MAX_CHANGES = 6;

/**
 * The dashboard's right column.
 *
 * Width and column placement are owned by `AppShell`, so this renders as a
 * plain stack. Both lists are derived from live records — nothing here is
 * illustrative sample data.
 */
export function RightPanel() {
  const { companies } = useCompanies();
  const { logs: logRecords } = useLogs(1, 40);

  const renewals = React.useMemo(
    () =>
      companies
        .filter((c: any) => c.status !== "inactive")
        .map((c: any) => ({
          id: c._id,
          name: c.companyName,
          days: daysUntil(c.renewalDate),
          date: formatDate(c.renewalDate, { day: "2-digit", month: "short" }),
        }))
        .filter((r: any) => Number.isFinite(r.days) && r.days >= 0)
        .sort((a: any, b: any) => a.days - b.days)
        .slice(0, MAX_RENEWALS),
    [companies],
  );

  const changes = React.useMemo(
    () =>
      (logRecords ?? [])
        .filter((log: any) => isImpField(log.field) && log.newValue != null)
        .map((log: any) => ({
          id: log._id,
          entity: String(log.entityType ?? "").toUpperCase(),
          field: log.field,
          actor: log.changedBy?.name ?? "System",
          at: log.createdAt,
          from: formatAuditValue(log.oldValue),
          to: formatAuditValue(log.newValue),
        }))
        .slice(0, MAX_CHANGES),
    [logRecords],
  );

  return (
    <div className="space-y-4">
      {/* ---------------- Renewals due ---------------- */}
      <section className="panel">
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <h2 className="micro-label">Due soon</h2>
          <Link
            href="/renewals"
            className="flex items-center gap-1 rounded-[2px] text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            All renewals
            <ArrowUpRight className="size-3" />
          </Link>
        </header>

        {renewals.length === 0 ? (
          <p className="body-sm px-5 py-6 text-muted-foreground">
            Nothing renews in the near term.
          </p>
        ) : (
          <ul>
            {renewals.map((item: any) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 last:border-b-0"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[13px] font-medium text-foreground">
                    {item.name}
                  </span>
                  <span className="tnum text-[11px] text-muted-foreground">
                    {item.date}
                  </span>
                </span>
                <span
                  className={cn(
                    "tnum shrink-0 rounded-[3px] border px-1.5 py-0.5 text-[10px] font-semibold",
                    item.days <= 3
                      ? "border-destructive/30 bg-destructive/8 text-destructive"
                      : "border-border bg-surface-alt text-muted-foreground",
                  )}
                >
                  {item.days}D
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------------- Recent changes ---------------- */}
      <section className="panel">
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <h2 className="micro-label">Recently changed</h2>
          <Link
            href="/logs"
            className="flex items-center gap-1 rounded-[2px] text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Audit log
            <ArrowUpRight className="size-3" />
          </Link>
        </header>

        {changes.length === 0 ? (
          <p className="body-sm px-5 py-6 text-muted-foreground">
            No recorded changes yet.
          </p>
        ) : (
          <ul>
            {changes.map((change: any) => (
              <li
                key={change.id}
                className="border-b border-border px-5 py-3 last:border-b-0"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[12px] font-medium text-foreground">
                    {change.field}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {change.entity}
                  </span>
                </div>

                <p className="mt-1.5 flex flex-wrap items-baseline gap-1.5 text-[11px]">
                  <span className="text-muted-foreground line-through">
                    {change.from}
                  </span>
                  <span className="text-muted-foreground/60">→</span>
                  <span className="font-medium text-foreground">
                    {change.to}
                  </span>
                </p>

                <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
                  {change.actor}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
