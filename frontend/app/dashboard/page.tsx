"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatsCards } from "@/components/stats-cards";
import { RightPanel } from "@/components/right-panel";
import { Button } from "@/components/ui/button";
import { Badge, BadgeDot } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMonthlyCharges } from "@/hooks/useQueries";
import { Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";

const OUTSTANDING_ROWS = 8;

export default function DashboardPage() {
  const {
    monthlyCharges,
    isLoading,
    isError,
    refetch,
  } = useMonthlyCharges();

  const payments = React.useMemo(() => {
    const rows = monthlyCharges?.companyPayments ?? [];
    return [...rows]
      .sort((a: any, b: any) => (b.pending ?? 0) - (a.pending ?? 0))
      .slice(0, OUTSTANDING_ROWS);
  }, [monthlyCharges]);

  const totalCharges = Number(monthlyCharges?.totalCharges) || 0;
  const totalPaid = Number(monthlyCharges?.totalPaid) || 0;
  const totalPending = Number(monthlyCharges?.totalPending) || 0;

  const collectedShare =
    totalCharges > 0 ? Math.min(100, (totalPaid / totalCharges) * 100) : 0;

  const periodLabel = React.useMemo(() => {
    const raw = monthlyCharges?.month;
    if (typeof raw === "string" && /^\d{4}-\d{2}$/.test(raw)) {
      const [year, month] = raw.split("-");
      return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
        "en-GB",
        { month: "long", year: "numeric" },
      );
    }
    return new Date().toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  }, [monthlyCharges?.month]);

  return (
    <AppShell
      title="Dashboard"
      description="Live position across the company register, billing and renewal schedule."
      actions={
        <Button asChild size="sm">
          <Link href="/dashboard/companies">Open company register</Link>
        </Button>
      }
      aside={<RightPanel />}
    >
      <div className="space-y-8">
        <StatsCards />

        {/* ---------------- This month's billing ---------------- */}
        <section className="panel">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="heading-2 text-foreground">Billing position</h2>
              <p className="body-sm mt-1 text-muted-foreground">
                {periodLabel} · all active accounts
              </p>
            </div>
            <Link
              href="/dashboard/companies"
              className="rounded-[2px] text-[12px] font-medium text-primary transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Manage payments
            </Link>
          </header>

          {isLoading ? (
            <div className="space-y-4 px-5 py-6">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <ErrorState
              title="Couldn't load billing"
              description="The monthly charges summary is unavailable right now."
              onRetry={() => refetch()}
            />
          ) : (
            <>
              {/* Three figures, set as type rather than three separate cards */}
              <div className="grid grid-cols-1 divide-border border-b border-border sm:grid-cols-3 sm:divide-x">
                {[
                  { label: "Billed", value: totalCharges },
                  { label: "Collected", value: totalPaid },
                  { label: "Outstanding", value: totalPending },
                ].map((figure) => (
                  <div key={figure.label} className="px-5 py-4">
                    <p className="micro-label">{figure.label}</p>
                    <p className="tnum mt-2 text-[1.375rem] leading-none font-semibold tracking-[-0.025em] text-foreground">
                      {formatCurrency(figure.value)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Flat two-segment proportion bar — no gradient, no rounding theatre */}
              <div className="px-5 py-5">
                <div
                  className="flex h-1.5 w-full overflow-hidden bg-muted"
                  role="img"
                  aria-label={`${Math.round(collectedShare)}% of the month collected`}
                >
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${collectedShare}%` }}
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="tnum">
                    {Math.round(collectedShare)}% collected
                  </span>
                  <span className="tnum">
                    {totalCharges > 0
                      ? `${Math.round(100 - collectedShare)}% outstanding`
                      : "No charges billed"}
                  </span>
                </div>
              </div>

              {/* Highest outstanding balances */}
              {payments.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No billed accounts yet"
                  description="Once active companies are added, their monthly charges appear here."
                  className="border-t border-border"
                  action={
                    <Button asChild size="sm" variant="outline">
                      <Link href="/dashboard/companies">Add a company</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="border-t border-border">
                  <div className="flex items-center justify-between px-5 pt-4 pb-1">
                    <h3 className="micro-label">Largest outstanding</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Charges</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Pending</TableHead>
                        {/* Redundant with the Pending figure on narrow screens */}
                        <TableHead className="hidden w-[110px] sm:table-cell">
                          State
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment: any) => {
                        const settled = (payment.pending ?? 0) <= 0;
                        return (
                          <TableRow key={String(payment.companyId)}>
                            <TableCell className="font-medium">
                              {payment.companyName}
                            </TableCell>
                            <TableCell className="tnum text-right text-muted-foreground">
                              {formatCurrency(payment.charges)}
                            </TableCell>
                            <TableCell className="tnum text-right text-muted-foreground">
                              {formatCurrency(payment.paid)}
                            </TableCell>
                            <TableCell className="tnum text-right font-medium">
                              {formatCurrency(payment.pending)}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge
                                variant={settled ? "success" : "warning"}
                              >
                                <BadgeDot />
                                {settled ? "Settled" : "Pending"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
