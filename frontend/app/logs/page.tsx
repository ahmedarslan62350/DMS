"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { motion, useInView } from "motion/react";
import { Clock, User, ArrowRight, Filter, Calendar } from "lucide-react";
import { useLogs } from "@/hooks/useQueries";

export default function LogsPage() {
  const maxPageRows = 5;

  const [page, setPage] = React.useState(1);
  const [allLogs, setAllLogs] = React.useState<any[]>([]);

  const { logs: rawLogs, isLoading } = useLogs(page, maxPageRows);

  const loadMoreRef = React.useRef(null);
  const isInView = useInView(loadMoreRef);

  React.useEffect(() => {
    if (rawLogs && rawLogs.length > 0) {
      setAllLogs((prev) => {
        const newLogs = rawLogs.filter(
          (rl: any) => !prev.some((p) => p._id === rl._id),
        );
        return [...prev, ...newLogs];
      });
    }
  }, [rawLogs]);

  React.useEffect(() => {
    if (isInView && !isLoading && rawLogs?.length === maxPageRows) {
      setPage((prev) => prev + 1);
    }

    console.log(page);
  }, [isInView, isLoading, rawLogs.length]);

  const logs = allLogs.map((log: any) => {
    const isAllFields = log.field === "all_fields";
    const fieldMap: Record<string, string> = {
      all_fields: log.action === "create" ? "NEW RECORD" : "DELETED RECORD",
      serverCharges: "Server Charges",
      status: "Status",
      noOfServers: "Servers",
      renewalDate: "Renewal Date",
      dialerLink: "Dialer Link",
    };

    const formatValue = (val: any, field: string) => {
      if (!val || val === "null") return "None";
      if (isAllFields) {
        try {
          const parsed = JSON.parse(val);
          return `Record: ${parsed.name || parsed.companyName || log.entityType}`;
        } catch (e) {
          console.log(e);
          return val;
        }
      }
      if (field === "serverCharges") return `$${Number(val).toLocaleString()}`;
      if (field === "status") return val.charAt(0).toUpperCase() + val.slice(1);
      return String(val);
    };

    return {
      id: log._id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId?._id || "N/A",
      field: fieldMap[log.field] || log.field,
      oldValue: formatValue(log.oldValue, log.field),
      newValue: formatValue(log.newValue, log.field),
      user: log.changedBy?.name || "System",
      userEmail: log.changedBy?.email || "",
      date: new Date(log.createdAt).toLocaleDateString(),
      time: new Date(log.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      targetName:
        log.entityId?.name || log.entityId?.companyName || log.entityType,
    };
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
          <header className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Activity Logs
              </h1>
              <p className="text-black/40 dark:text-white/40 font-medium">
                Audit trail of all changes across the portal.
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm font-medium">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </header>

          <div className="relative space-y-8">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-black/5 dark:bg-white/10" />

            {logs.map((log: any, index: number) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-12 group mb-6"
              >
                {/* Timeline Dot with Action Color */}
                <div
                  className={`absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 z-10 transition-transform group-hover:scale-125 ${
                    log.action === "create"
                      ? "bg-emerald-500 border-emerald-500"
                      : log.action === "delete"
                        ? "bg-red-500 border-red-500"
                        : "bg-white dark:bg-black border-black dark:border-white"
                  }`}
                />

                <div className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-black/60 dark:text-white/60">
                          {log.entityType}
                        </span>
                        <span className="text-xs font-bold text-black/80 dark:text-white/90">
                          {log.targetName}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-black/20 dark:text-white/20 tracking-tighter">
                        ID: {log.entityId}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-wider text-right">
                      <div className="flex flex-col items-end">
                        <span className="flex items-center gap-1 text-black/80 dark:text-white/90">
                          <User className="w-3 h-3" /> {log.user}
                        </span>
                        <span className="text-[8px] font-medium lowercase opacity-50">
                          {log.userEmail}
                        </span>
                      </div>
                      <div className="flex flex-col items-end border-l border-black/5 pl-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {log.date}
                        </span>
                        <span className="flex items-center gap-1 text-[8px] opacity-60">
                          <Clock className="w-2.5 h-2.5" /> {log.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.action === "create"
                          ? "text-emerald-600 bg-emerald-50"
                          : "bg-black/5 dark:bg-white/5"
                      }`}
                    >
                      Field: {log.field}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex-1 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 min-w-0">
                      <p className="text-[9px] uppercase font-bold text-black/30 dark:text-white/30 mb-1">
                        Old Value
                      </p>
                      <p className="text-xs font-medium truncate line-through opacity-40">
                        {log.oldValue}
                      </p>
                    </div>

                    <ArrowRight
                      className={`w-4 h-4 shrink-0 ${log.action === "create" ? "text-emerald-400" : "text-black/10"}`}
                    />

                    <div
                      className={`flex-1 p-3 rounded-xl border min-w-0 ${
                        log.action === "create"
                          ? "bg-emerald-50/20 border-emerald-100"
                          : "bg-black/[0.02] dark:bg-white/[0.02] border-black/5"
                      }`}
                    >
                      <p className="text-[9px] uppercase font-bold text-black/30 dark:text-white/30 mb-1">
                        New Value
                      </p>
                      <p
                        className={`text-xs font-bold truncate ${
                          log.action === "create"
                            ? "text-emerald-600"
                            : "text-blue-600"
                        }`}
                      >
                        {log.newValue}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div
          ref={loadMoreRef}
          className="h-1 w-full flex items-center justify-center"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black dark:border-white" />
          )}
        </div>
      </main>
    </div>
  );
}
