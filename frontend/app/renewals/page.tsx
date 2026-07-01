"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { motion } from "motion/react";
import { Bell, Calendar, Building2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/hooks/useQueries";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function RenewalsPage() {
  const { companies } = useCompanies();
  const today = new Date();

  const renewals = companies
    .map((c: any) => {
      if (c.status === "inactive") return null;
      const renewalDate = new Date(c.renewalDate);

      const diffTime = renewalDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status = "Upcoming";
      if (diffDays <= 3) status = "Urgent";
      else if (diffDays <= 5) status = "Pending";
      else {
        return null;
      }

      const returnData = {
        id: c._id,
        name: c.companyName,
        days: diffDays,
        date: renewalDate.toISOString().split("T")[0],
        amount: c.serverCharges,
        status: status,
      };

      return returnData;
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.days - b.days);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <div className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6 lg:p-8">
          <PageHeader
            title="Renewal Alerts"
            description="Monitor upcoming subscription renewals and payment deadlines."
            className="mb-8 sm:mb-12"
          />

          {renewals.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card shadow-sm">
              <EmptyState
                icon={Bell}
                title="No renewals due soon"
                description="Companies with a renewal within the next 5 days will show up here."
              />
            </div>
          ) : (
            <div className="grid gap-4">
              {renewals.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-4 transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-white/10 dark:bg-black"
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                        item.status === "Urgent"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40",
                      )}
                    >
                      <Bell className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="flex flex-wrap items-center gap-2 text-lg font-bold">
                        <span className="truncate">{item.name}</span>
                        {item.status === "Urgent" && (
                          <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                            Urgent
                          </span>
                        )}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-black/40 dark:text-white/40">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {item.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" /> {item.amount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-8 sm:justify-end">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{item.days}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
                        Days Left
                      </p>
                    </div>
                    <button
                      aria-label={`View ${item.name} renewal details`}
                      className="p-3 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:scale-105 transition-all active:scale-95"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
