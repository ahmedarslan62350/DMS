"use client";

import * as React from "react";
import { useCompanies, useMonthlyCharges } from "@/hooks/useQueries";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency, formatNumber } from "@/lib/helpers";

/**
 * Four figures that actually exist in the database.
 *
 * The previous version rendered three near-identical money cards and a
 * hardcoded "trend" pill on each. These are derived from real records, and
 * the qualifier line states plainly what the number counts.
 */
export function StatsCards() {
  const { companies, isLoading: companiesLoading } = useCompanies();
  const { monthlyCharges, isLoading: chargesLoading } = useMonthlyCharges();

  const isLoading = companiesLoading || chargesLoading;

  const activeCompanies = companies.filter(
    (c: any) => c.status === "active",
  ).length;

  const totalServers = companies
    .filter((c: any) => c.status === "active")
    .reduce((sum: number, c: any) => sum + (Number(c.noOfServers) || 0), 0);

  const totalCharges = Number(monthlyCharges?.totalCharges) || 0;
  const totalPaid = Number(monthlyCharges?.totalPaid) || 0;
  const totalPending = Number(monthlyCharges?.totalPending) || 0;

  const collectionRate =
    totalCharges > 0 ? Math.round((totalPaid / totalCharges) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        loading={isLoading}
        label="Active companies"
        value={formatNumber(activeCompanies)}
        hint={`${formatNumber(companies.length)} in the register`}
      />
      <StatCard
        loading={isLoading}
        label="Servers managed"
        value={formatNumber(totalServers)}
        hint="Across active accounts"
      />
      <StatCard
        loading={isLoading}
        label="Collected"
        value={formatCurrency(totalPaid)}
        hint={`${collectionRate}% of ${formatCurrency(totalCharges)} billed`}
      />
      <StatCard
        loading={isLoading}
        label="Outstanding"
        value={formatCurrency(totalPending)}
        hint="Due this billing month"
        trend={totalPending > 0 ? "Unsettled" : "Settled"}
        trendDirection={totalPending > 0 ? "down" : "up"}
      />
    </div>
  );
}
