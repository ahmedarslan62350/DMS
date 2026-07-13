"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { motion, useInView } from "motion/react";
import { Clock, User, ArrowRight, Calendar } from "lucide-react";

import { useLogs, useEntityLogs, useCompanies } from "@/hooks/useQueries";
import { isImpField } from "@/lib/helpers";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LogsPage() {
  const loadMoreRef = React.useRef(null);
  const isInView = useInView(loadMoreRef);

  const [search, setSearch] = React.useState("");
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>("");

  const [page, setPage] = React.useState(1);
  const [idx, setIdx] = React.useState(0);
  const [allLogs, setAllLogs] = React.useState<any[]>([]);

  const { companies } = useCompanies();

  const filteredCompanies = React.useMemo(() => {
    if (!search.trim()) return companies;

    const searchLower = search.toLowerCase();
    return companies.filter(
      (c: any) =>
        (c.companyName || c.name || "").toLowerCase().includes(searchLower) ||
        (c.dialerLink && c.dialerLink.toLowerCase().includes(searchLower)),
    );
  }, [companies, search]);

  const {
    logs: globalLogs,
    isLoading: isGlobalLoading,
    isError: isGlobalError,
    refetch: refetchGlobal,
  } = useLogs(page, 20);

  const {
    logs: companyLogs,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
    refetch: refetchCompany,
  } = useEntityLogs("Company", selectedCompanyId, idx);

  const rawLogs = selectedCompanyId ? companyLogs : globalLogs;

  const isLoading = selectedCompanyId ? isCompanyLoading : isGlobalLoading;
  const isError = selectedCompanyId ? isCompanyError : isGlobalError;
  const refetchActive = selectedCompanyId ? refetchCompany : refetchGlobal;

  React.useEffect(() => {
    setAllLogs([]);
    setPage(1);
    setIdx(0);
  }, [selectedCompanyId]);

  React.useEffect(() => {
    console.log(rawLogs, companyLogs);
    if (!rawLogs?.length) return;

    setAllLogs((prev) => {
      const existing = new Set(prev.map((l: any) => l._id));

      return [...prev, ...rawLogs.filter((l: any) => !existing.has(l._id))];
    });
  }, [rawLogs]);

  React.useEffect(() => {
    if (!isInView || isLoading) return;

    if (selectedCompanyId) {
      if (companyLogs.length === 20) {
        setIdx((prev) => prev + 1);
      }
    } else {
      if (globalLogs.length === 20) {
        setPage((prev) => prev + 1);
      }
    }
  }, [isInView, isLoading, selectedCompanyId, companyLogs, globalLogs]);

  const logs = allLogs
    .map((log: any) => {
      if (!isImpField(log.field)) return null;

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
            return `Record: ${
              parsed.name || parsed.companyName || log.entityType
            }`;
          } catch {
            return val;
          }
        }

        if (field === "serverCharges")
          return `$${Number(val).toLocaleString()}`;

        if (field === "status")
          return val.charAt(0).toUpperCase() + val.slice(1);

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
        date: new Date(log.createdAt).toLocaleDateString("en-US", {
          timeZone: "UTC",
        }),
        time: new Date(log.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        }),
        targetName:
          log.entityId?.name || log.entityId?.companyName || "Company",
      };
    })
    .filter(Boolean);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <div className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-8 flex flex-col gap-6 sm:mb-12">
            <PageHeader
              title="Activity Logs"
              description="Audit trail of all changes across the portal."
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <div className="relative min-w-0 flex-1 sm:min-w-[280px]">
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  placeholder="Search companies..."
                  className="h-11 rounded-xl px-4"
                />

                {search && !selectedCompanyId && (
                  <div className="absolute z-10 mt-2 w-full rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-black max-h-64 overflow-y-auto shadow-lg">
                    {filteredCompanies.map((company: any) => (
                      <button
                        key={company._id}
                        onClick={() => {
                          setSelectedCompanyId(company._id);
                          setSearch(company.companyName || company.name);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition"
                      >
                        {company.companyName || company.name}
                        <span className="text-[10px] font-mono text-black/40 dark:text-white/40 ml-3">
                          ID: {company.intId}
                        </span>
                      </button>
                    ))}

                    {!filteredCompanies.length && (
                      <div className="px-4 py-3 text-sm text-black/40 dark:text-white/40">
                        No companies found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedCompanyId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCompanyId("");
                    setSearch("");
                  }}
                  className="h-11 shrink-0 rounded-xl px-4"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>

          {isError && allLogs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card shadow-sm">
              <ErrorState
                title="Couldn't load activity logs"
                description="There was a problem fetching the audit trail. Please try again."
                onRetry={refetchActive}
              />
            </div>
          ) : isLoading && allLogs.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card shadow-sm">
              <EmptyState
                icon={Clock}
                title="No activity yet"
                description={
                  selectedCompanyId
                    ? "This company doesn't have any recorded changes yet."
                    : "Changes made across the portal will show up here."
                }
              />
            </div>
          ) : (
            <div className="relative space-y-8">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-black/5 dark:bg-white/10" />

              {logs.map((log: any, index: number) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-12 group mb-6"
                >
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

                        <span className="text-[10px] font-mono text-black/40 dark:text-white/40 ml-1">
                          ID: {log.entityId ? log.entityId : selectedCompanyId}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-wider text-right">
                        <div className="flex flex-col items-end">
                          <span className="flex items-center gap-1 text-black/80 dark:text-white/90">
                            <User className="w-3 h-3" /> {log.user}
                          </span>
                          <span className="text-[8px] opacity-50">
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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/5">
                        Field: {log.field}
                      </span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex-1 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                        <p className="text-[9px] uppercase font-bold text-black/30">
                          Old Value
                        </p>
                        <p className="text-xs opacity-40 line-through truncate">
                          {log.oldValue}
                        </p>
                      </div>

                      <ArrowRight className="w-4 h-4 text-black/10" />

                      <div
                        className={`flex-1 p-3 rounded-xl border ${
                          log.action === "create"
                            ? "bg-emerald-50/20 border-emerald-100"
                            : "bg-black/[0.02] dark:bg-white/[0.02] border-black/5"
                        }`}
                      >
                        <p className="text-[9px] uppercase font-bold text-black/30">
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
          )}

          <div
            ref={loadMoreRef}
            className="h-10 flex items-center justify-center"
          >
            {isLoading && allLogs.length > 0 && (
              <div className="animate-spin h-6 w-6 border-b-2 border-black dark:border-white rounded-full" />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}






