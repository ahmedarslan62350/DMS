"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { motion } from "motion/react";
import { Bell, Calendar, Building2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/hooks/useQueries";

export default function RenewalsPage() {
  const { companies } = useCompanies();
  const today = new Date();

  const renewals = companies
    .map((c: any) => {
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
    .filter((r: any) => r.days >= 0)
    .sort((a: any, b: any) => a.days - b.days);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
          <header className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Renewal Alerts
            </h1>
            <p className="text-black/40 dark:text-white/40 font-medium">
              Monitor upcoming subscription renewals and payment deadlines.
            </p>
          </header>

          <div className="grid gap-4">
            {renewals.map((item: any, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      item.status === "Urgent"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40",
                    )}
                  >
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      {item.name}
                      {item.status === "Urgent" && (
                        <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Urgent
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-black/40 dark:text-white/40">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" /> {item.amount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{item.days}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
                      Days Left
                    </p>
                  </div>
                  <button className="p-3 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:scale-105 transition-all active:scale-95">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
