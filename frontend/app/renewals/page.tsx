"use client";

import * as React from "react";
import { BellRing } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompanies } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Renders a UTC calendar date without touching the host locale or timezone.
 *
 * `toLocaleDateString` resolves against the runtime timezone, so a server
 * render (UTC) and a browser render (local) can disagree and trip a hydration
 * mismatch on this route. Formatting the ISO parts directly is deterministic.
 */
function formatIsoDate(value: Date): string {
  if (Number.isNaN(value.getTime())) return "—";

  const [year, month, day] = value.toISOString().slice(0, 10).split("-");
  const monthLabel = MONTHS[Number(month) - 1] ?? month;

  return `${day} ${monthLabel} ${year}`;
}

function formatCurrency(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";

  return `$${amount.toLocaleString("en-US")}`;
}

export default function RenewalsPage() {
  const { companies, isLoading, isError, refetch } = useCompanies();
  const today = new Date();

  // Business rules unchanged: active companies only, ≤3 days = Urgent,
  // ≤5 days = Pending, everything else falls out of the queue entirely.
  const renewals = React.useMemo(() => {
    return (companies as any[])
      .map((c: any) => {
        if (c.status === "inactive") return null;

        const renewalDate = new Date(c.renewalDate);
        const diffTime = renewalDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status = "Upcoming";
        if (diffDays <= 3) status = "Urgent";
        else if (diffDays <= 5) status = "Pending";
        else return null;

        return {
          id: c._id,
          intId: c.intId,
          name: c.companyName,
          days: diffDays,
          date: renewalDate,
          amount: c.serverCharges,
          status,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.days - b.days) as {
      id: string;
      intId?: number;
      name: string;
      days: number;
      date: Date;
      amount: unknown;
      status: string;
    }[];
    // `today` is intentionally excluded: it is read once per render pass and
    // including it would rebuild the queue on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies]);

  const urgentCount = renewals.filter((r) => r.status === "Urgent").length;
  const pendingCount = renewals.length - urgentCount;
  const totalCharges = renewals.reduce((sum, r) => {
    const amount = Number(r.amount);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);

  return (
    <AppShell
      title="Renewals"
      description="Active subscriptions with a renewal date inside the next five days. Sorted by urgency."
    >
      <div className="panel overflow-hidden rounded-md">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border px-4 py-3">
          <p className="micro-label">Due within five days</p>

          {!isLoading && !isError && (
            <p className="tnum text-[11px] text-muted-foreground">
              {renewals.length} due
              <span className="mx-1.5 text-border-strong">·</span>
              <span className="text-destructive">{urgentCount} urgent</span>
              <span className="mx-1.5 text-border-strong">·</span>
              <span className="text-warning">{pendingCount} pending</span>
              <span className="mx-1.5 text-border-strong">·</span>
              {formatCurrency(totalCharges)} billed
            </p>
          )}
        </div>

        {isError ? (
          <ErrorState
            title="Couldn't load renewals"
            description="There was a problem fetching company renewal dates. Please try again."
            onRetry={() => void refetch()}
          />
        ) : isLoading ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Company</TableHead>
                <TableHead>Renewal date</TableHead>
                <TableHead className="text-right">Charge</TableHead>
                <TableHead className="text-right">Days remaining</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableSkeleton rows={5} columns={5} />
            </TableBody>
          </Table>
        ) : renewals.length === 0 ? (
          <EmptyState
            icon={BellRing}
            title="No renewals due in the next five days"
            description="Active companies whose renewal date falls inside the five-day window will appear here automatically."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Company</TableHead>
                <TableHead>Renewal date</TableHead>
                <TableHead className="text-right">Charge</TableHead>
                <TableHead className="text-right">Days remaining</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renewals.map((item, index) => (
                <TableRow
                  key={item.id}
                  className={cn(index % 2 === 1 && "bg-surface-alt")}
                >
                  <TableCell>
                    <p className="truncate font-medium text-foreground">
                      {item.name}
                    </p>
                    {item.intId !== undefined && item.intId !== null && (
                      <p className="mono-id mt-0.5 text-muted-foreground">
                        ID {item.intId}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="tnum text-muted-foreground">
                    {formatIsoDate(item.date)}
                  </TableCell>

                  <TableCell className="tnum text-right text-foreground">
                    {formatCurrency(item.amount)}
                  </TableCell>

                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "tnum font-medium",
                        item.status === "Urgent"
                          ? "text-destructive"
                          : "text-warning",
                      )}
                    >
                      {item.days}
                    </span>
                    <span className="ml-1 text-[11px] text-muted-foreground">
                      {Math.abs(item.days) === 1 ? "day" : "days"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={item.status === "Urgent" ? "destructive" : "warning"}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AppShell>
  );
}
