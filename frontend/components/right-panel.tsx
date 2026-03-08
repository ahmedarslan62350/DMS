"use client";

import * as React from "react";
import { Bell, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanies, useLogs } from "@/hooks/useQueries";
import { isImpField } from "@/lib/helpers";

export function RightPanel() {
  const { companies } = useCompanies() || [];
  const today = new Date();

  const { logs: logsData } = useLogs() || { data: [] };

  const logs = (logsData || [])
    .map((log: any) => {
      if (!isImpField(log.field) || !log.newValue) return null;

      const isCreate = log.action === "create";
      if (log.field.toLowerCase())
        return {
          id: log._id,
          entity: log.entityType.toUpperCase(),
          entityId: log.entityId._id,
          field: log.field,
          action: isCreate
            ? `CREATED (${log.field?.toUpperCase()})`
            : `UPDATED (${log.field?.toUpperCase()})`,
          // Capture the full change details
          oldVal: log.oldValue ?? "NULL",
          newVal: log.newValue ?? "NULL",
          user: log.changedBy?.name || "System",
          email: log.changedBy?.email,
          date: new Date(log.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          fullDate: new Date(log.createdAt).toLocaleDateString(),
          rawDate: new Date(log.createdAt),
        };
    })
    .filter(Boolean)
    .slice(0, 3)
    .sort((a: any, b: any) => b.rawDate - a.rawDate);

  const renewals = companies
    .map((c: any) => {
      const expiry = new Date(c.renewalDate);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: c._id,
        name: c.companyName,
        days: diffDays,
        date: expiry.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }),
      };
    })
    .filter((r: any) => r.days >= 0)
    .sort((a: any, b: any) => a.days - b.days)
    .slice(0, 3);

  return (
    <aside className="w-80 shrink-0 hidden xl:flex flex-col gap-6 sticky top-28 h-[calc(150vh-140px)]">
      {/* Upcoming Renewals */}
      <section className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-black/40 dark:text-white/40" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Upcoming Renewals
          </h3>
        </div>
        <div className="space-y-4">
          {renewals.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between group"
            >
              <div>
                <p className="text-sm font-bold">{item.name}</p>
                <p className="text-xs text-black/40 dark:text-white/40">
                  {item.date}
                </p>
              </div>
              <div
                className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-bold",
                  item.days <= 3
                    ? "bg-red-500/10 text-red-500"
                    : "bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60",
                )}
              >
                {item.days}D LEFT
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Changes */}
      <section className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-2xl pt-6 px-6 pb-2 shadow-sm flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-black/40 dark:text-white/40" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Audit Logs
            </h3>
          </div>
          <span className="text-[10px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full text-black/40">
            {logs.length} Total
          </span>
        </div>

        <div className="space-y-8 relative">
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-black/5 dark:bg-white/10" />

          {logs.length > 0 ? (
            logs.map((log: any) => (
              <div key={log.id} className="relative pl-6">
                <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-black border-2 border-black dark:border-white z-10" />

                <div className="flex flex-col gap-2">
                  {/* Header: Action & Time */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">
                      {log.action}
                    </span>
                    <span className="text-[9px] text-black/30 dark:text-white/30 font-mono">
                      {log.fullDate} {log.date}
                    </span>
                  </div>

                  {/* Entity Info */}
                  <div className="flex gap-2 text-[9px] font-mono text-black/40 dark:text-white/40">
                    <span className="bg-black/5 dark:bg-white/10 px-1 rounded">
                      {log.entity}
                    </span>
                    <span className="truncate max-w-[100px]">
                      ID: {log.entityId}
                    </span>
                  </div>

                  {/* Value Comparison */}
                  <div className="grid grid-cols-2 gap-2 bg-black/[0.02] dark:bg-white/[0.02] p-2 rounded-lg border border-black/5 dark:border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase text-black/30">
                        From
                      </span>
                      <span className="text-[10px] font-medium truncate text-red-500/80 line-through">
                        {String(log.oldVal)}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-black/5 dark:border-white/5 pl-2">
                      <span className="text-[8px] uppercase text-black/30">
                        To
                      </span>
                      <span className="text-[10px] font-medium truncate text-green-600 dark:text-green-400">
                        {String(log.newVal)}
                      </span>
                    </div>
                  </div>

                  {/* Footer: User */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="px-2 h-4 rounded-xs bg-black/10 dark:bg-white/10 flex items-center justify-center text-[8px] font-bold">
                      {log.user}
                    </div>
                    <p className="text-[10px] text-black/60 dark:text-white/60 font-semibold">
                      <span className="font-normal opacity-50">
                        ({log.email})
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="pl-6 py-4 text-xs text-black/40 dark:text-white/40 italic">
              No logs found in the database.
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
