"use client";

import * as React from "react";
import { ArrowRight, History } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLogs } from "@/hooks/useQueries";
import { isImpField } from "@/lib/helpers";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const EM_DASH = "—";

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
 * Audit logs land in the browser as ISO strings. Rendering them through
 * `toLocaleString` resolves against the runtime timezone, which differs
 * between the server pass and the browser and would desync hydration, so the
 * ISO parts are formatted explicitly instead.
 */
function formatTimestamp(raw: unknown): { date: string; time: string } {
  if (typeof raw !== "string" && !(raw instanceof Date)) {
    return { date: EM_DASH, time: EM_DASH };
  }

  const iso = new Date(raw as string | Date);
  if (Number.isNaN(iso.getTime())) return { date: EM_DASH, time: EM_DASH };

  const [datePart, timePart = ""] = iso.toISOString().split("T");
  const [year, month, day] = datePart.split("-");

  return {
    date: `${day} ${MONTHS[Number(month) - 1] ?? month} ${year}`,
    time: timePart.slice(0, 8),
  };
}

/** `null`, `undefined` and the literal string "null" all read as an em dash. */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return EM_DASH;

  const text =
    typeof value === "string" ? value : (JSON.stringify(value) ?? "");

  if (!text.trim()) return EM_DASH;
  if (text.trim() === "null" || text.trim() === "undefined") return EM_DASH;

  return text;
}

/**
 * Create/delete rows store a whole document as JSON. Showing the raw blob in a
 * table cell is unreadable, so the identifying field is lifted out of it.
 */
function formatSnapshot(value: unknown): string | null {
  if (typeof value !== "string") return null;

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;

    const label =
      parsed.companyName ??
      parsed.name ??
      parsed.key ??
      parsed.email ??
      parsed.description;

    return typeof label === "string" && label.trim() ? label : "Record snapshot";
  } catch {
    return null;
  }
}

const FIELD_LABELS: Record<string, string> = {
  all_fields: "Record",
  companyName: "Company name",
  dialerLink: "Dialer link",
  noOfServers: "Servers",
  serverCharges: "Server charges",
  paidAmount: "Paid amount",
  renewalDate: "Renewal date",
  joiningDate: "Joining date",
  inactiveDate: "Inactive date",
  additionalComment: "Additional comment",
  comment: "Renewal details",
  password: "Password",
  status: "Status",
  role: "Role",
  permissions: "Permissions",
};

/** `noOfServers` → `No of servers`, so unmapped fields still read as English. */
function humaniseField(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];

  const spaced = field
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();

  if (!spaced) return field;

  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

const ACTION_VARIANT = {
  create: "success",
  delete: "destructive",
  update: "neutral",
} as const;

interface AuditRow {
  id: string;
  date: string;
  time: string;
  actorName: string;
  actorEmail: string;
  entityType: string;
  entityId: string;
  entityLabel: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export default function LogsPage() {
  const [page, setPage] = React.useState(1);

  const { logs, isLoading, isError, refetch, total } = useLogs(page, PAGE_SIZE);

  const rows = React.useMemo<AuditRow[]>(() => {
    return (logs as any[])
      .filter((log: any) => isImpField(log.field))
      .map((log: any) => {
        const { date, time } = formatTimestamp(log.createdAt);
        const isSnapshot = log.field === "all_fields";

        const entityRef = log.entityId;
        const entityId =
          entityRef && typeof entityRef === "object"
            ? (entityRef._id ?? EM_DASH)
            : (entityRef ?? EM_DASH);

        const entityLabel =
          entityRef && typeof entityRef === "object"
            ? (entityRef.companyName ?? entityRef.name ?? entityRef.key ?? "")
            : "";

        const oldSnapshot = isSnapshot ? formatSnapshot(log.oldValue) : null;
        const newSnapshot = isSnapshot ? formatSnapshot(log.newValue) : null;

        return {
          id: String(log._id),
          date,
          time,
          actorName: log.changedBy?.name ?? "System",
          actorEmail: log.changedBy?.email ?? "",
          entityType: log.entityType ?? EM_DASH,
          entityId: String(entityId),
          entityLabel: typeof entityLabel === "string" ? entityLabel : "",
          action: log.action ?? "update",
          field: isSnapshot
            ? log.action === "create"
              ? "New record"
              : log.action === "delete"
                ? "Deleted record"
                : humaniseField(log.field)
            : humaniseField(log.field),
          oldValue: isSnapshot ? (oldSnapshot ?? formatValue(log.oldValue)) : formatValue(log.oldValue),
          newValue:
            isSnapshot && log.action === "delete"
              ? "Deleted"
              : isSnapshot && newSnapshot
                ? newSnapshot
                : formatValue(log.newValue),
        };
      });
  }, [logs]);

  const pageCount = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));
  const canGoBack = page > 1;
  const canGoForward = page < pageCount;

  return (
    <AppShell
      title="Audit log"
      description="Every recorded change across users, companies, roles and permissions — who changed what, and from which value to which."
    >
      <div className="panel overflow-hidden rounded-md">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border px-4 py-3">
          <p className="micro-label">Change history</p>
          <p className="tnum text-[11px] text-muted-foreground">
            {total || 0} recorded
          </p>
        </div>

        {isError ? (
          <ErrorState
            title="Couldn't load the audit trail"
            description="There was a problem fetching recorded changes. Please try again."
            onRetry={() => void refetch()}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[130px]">Timestamp</TableHead>
                  <TableHead className="w-[200px]">Actor</TableHead>
                  <TableHead className="w-[190px]">Entity</TableHead>
                  <TableHead className="w-[90px]">Action</TableHead>
                  <TableHead className="w-[150px]">Field</TableHead>
                  <TableHead className="min-w-[320px]">Change</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableSkeleton rows={8} columns={6} />
                ) : rows.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="whitespace-normal p-0">
                      <EmptyState
                        icon={History}
                        title="No recorded changes"
                        description={
                          page > 1
                            ? "This page of the audit trail is empty. Return to the first page."
                            : "Once a user, company, role or permission is created or modified, the change is recorded here."
                        }
                        action={
                          page > 1 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(1)}
                            >
                              Back to first page
                            </Button>
                          ) : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => {
                    const variant =
                      ACTION_VARIANT[row.action as keyof typeof ACTION_VARIANT] ??
                      "neutral";

                    return (
                      <TableRow
                        key={row.id}
                        className={cn(index % 2 === 1 && "bg-surface-alt")}
                      >
                        <TableCell>
                          <p className="tnum text-foreground">{row.date}</p>
                          <p className="mono-id mt-0.5 text-muted-foreground">
                            {row.time}
                          </p>
                        </TableCell>

                        <TableCell>
                          <p className="truncate font-medium text-foreground">
                            {row.actorName}
                          </p>
                          {row.actorEmail && (
                            <p className="truncate text-[11px] text-muted-foreground">
                              {row.actorEmail}
                            </p>
                          )}
                        </TableCell>

                        <TableCell>
                          <p className="micro-label">{row.entityType}</p>
                          <p
                            className="mono-id mt-1 truncate text-muted-foreground"
                            title={row.entityId}
                          >
                            {row.entityLabel || row.entityId}
                          </p>
                        </TableCell>

                        <TableCell>
                          <Badge variant={variant}>{row.action}</Badge>
                        </TableCell>

                        <TableCell className="text-foreground">
                          {row.field}
                        </TableCell>

                        <TableCell>
                          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span
                              className={cn(
                                "max-w-[16rem] truncate text-muted-foreground",
                                row.oldValue !== EM_DASH && "line-through",
                              )}
                              title={row.oldValue}
                            >
                              {row.oldValue}
                            </span>
                            <ArrowRight
                              className="size-3 shrink-0 self-center text-border-strong"
                              aria-hidden="true"
                            />
                            <span
                              className="max-w-[16rem] truncate font-medium text-foreground"
                              title={row.newValue}
                            >
                              {row.newValue}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {!isLoading && rows.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
                <p className="tnum text-[11px] text-muted-foreground">
                  Page {page} of {pageCount}
                  <span className="mx-1.5 text-border-strong">·</span>
                  {rows.length} shown
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canGoBack}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canGoForward}
                    onClick={() =>
                      setPage((current) => Math.min(pageCount, current + 1))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
