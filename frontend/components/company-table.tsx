"use client";

import * as React from "react";
import {
  Copy,
  Check,
  Edit2,
  ExternalLink,
  Loader2,
  Building2,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/hooks/useQueries";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge, BadgeDot } from "./ui/badge";
import {
  ColumnResizeHandle,
  useResizableColumns,
  type ResizableColumnDef,
} from "./ui/resizable-table";
import { TableSkeleton } from "./shared/table-skeleton";
import { EmptyState } from "./shared/empty-state";
import { ErrorState } from "./shared/error-state";
import { daysUntil, formatCurrency, formatNumber } from "@/lib/helpers";

async function copyTextToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  if (typeof document === "undefined") {
    throw new TypeError("Clipboard API not available.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  const successful = document.execCommand("copy");
  textarea.remove();

  if (!successful) {
    throw new Error("Fallback copy failed.");
  }
}

interface CompanyTableProps {
  onEditClick: (company: any) => void;
  onAddClick: () => void;
  onPaidAmountChange: (companyId: string, newAmount: number) => Promise<void>;
  onFieldClick?: (companyId: string, fieldName: string) => void;
}

/** Maps table column ids to MongoDB / audit-log field names */
export const COLUMN_TO_AUDIT_FIELD: Record<string, string> = {
  name: "companyName",
  renewalDate: "renewalDate",
  dialerLink: "dialerLink",
  password: "password",
  servers: "noOfServers",
  charges: "serverCharges",
  paidAmount: "paidAmount",
  status: "status",
  inactiveDate: "inactiveDate",
  comment: "comment",
  additionalComment: "additionalComment",
  joiningDate: "joiningDate",
};

export const AUDIT_FIELD_LABELS: Record<string, string> = {
  companyName: "Company Name",
  renewalDate: "Renewal Date",
  dialerLink: "Dialer Link",
  password: "Password",
  noOfServers: "Servers",
  serverCharges: "Charges",
  paidAmount: "Paid Amount",
  status: "Status",
  inactiveDate: "Inactive Date",
  comment: "Renewal Details",
  additionalComment: "Additional Comment",
  joiningDate: "Joining Date",
};

/*
 * Default widths are tuned so every decision-critical column — company,
 * renewal, charges, paid amount — fits inside the content area at 1440px
 * without horizontal scrolling. The longer reference columns scroll.
 */
const COLUMNS: (ResizableColumnDef & { label: string; align?: "right" })[] = [
  { id: "name", width: 196, minWidth: 150, label: "Company" },
  { id: "renewalDate", width: 118, minWidth: 104, label: "Renewal" },
  { id: "dialerLink", width: 156, minWidth: 120, label: "Dialer Link" },
  { id: "password", width: 104, minWidth: 88, label: "Password" },
  { id: "servers", width: 74, minWidth: 68, label: "Servers", align: "right" },
  { id: "charges", width: 96, minWidth: 84, label: "Charges", align: "right" },
  { id: "paidAmount", width: 176, minWidth: 162, label: "Paid Amount" },
  { id: "status", width: 100, minWidth: 90, label: "Status" },
  { id: "inactiveDate", width: 118, minWidth: 104, label: "Inactive" },
  { id: "comment", width: 184, minWidth: 140, label: "Renewal Details" },
  {
    id: "additionalComment",
    width: 184,
    minWidth: 140,
    label: "Additional Comment",
  },
  { id: "joiningDate", width: 118, minWidth: 104, label: "Joined" },
  {
    id: "actions",
    width: 60,
    minWidth: 56,
    maxWidth: 90,
    label: "Actions",
    align: "right",
  },
];

function LoggableCell({
  companyId,
  columnId,
  onFieldClick,
  className,
  children,
}: Readonly<{
  companyId: string;
  columnId: string;
  onFieldClick?: (companyId: string, fieldName: string) => void;
  className?: string;
  children: React.ReactNode;
}>) {
  const auditField = COLUMN_TO_AUDIT_FIELD[columnId];
  const isClickable = !!onFieldClick && !!auditField;

  const handleActivate = () => {
    if (!isClickable) return;
    onFieldClick(companyId, auditField);
  };

  return (
    <TableCell
      className={cn(
        isClickable &&
          "cursor-pointer transition-colors hover:bg-primary/5 focus-visible:bg-primary/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      onClick={isClickable ? handleActivate : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleActivate();
              }
            }
          : undefined
      }
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? "button" : undefined}
      aria-label={
        isClickable
          ? `View change history for ${AUDIT_FIELD_LABELS[auditField] ?? auditField}`
          : undefined
      }
    >
      {children}
    </TableCell>
  );
}

/** Small copy-to-clipboard affordance used by the password column. */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        void copyTextToClipboard(value)
          .then(() => {
            setCopied(true);
            if (timeout.current) clearTimeout(timeout.current);
            timeout.current = setTimeout(() => setCopied(false), 1500);
          })
          .catch((error) => console.error("Copy failed:", error));
      }}
      className="rounded-[3px] p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
    >
      {copied ? (
        <Check className="size-3.5 text-success" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
  );
}

export function CompanyTable({
  onEditClick,
  onAddClick,
  onPaidAmountChange,
  onFieldClick,
}: Readonly<CompanyTableProps>) {
  const [status, setStatus] = React.useState<"Active" | "Inactive" | "All">(
    "Active",
  );
  const [paymentStatus, setPaymentStatus] = React.useState<
    "All" | "Paid" | "Not Paid"
  >("All");
  const [search, setSearch] = React.useState("");
  const [localPaidAmounts, setLocalPaidAmounts] = React.useState<
    Record<string, number>
  >({});
  const [savingPaidAmounts, setSavingPaidAmounts] = React.useState<Set<string>>(
    new Set(),
  );

  const { companies: companiesData, isLoading, isError, refetch } =
    useCompanies();

  const { widths, startResize, nudgeColumn, resetColumn } =
    useResizableColumns(COLUMNS);

  const allCompanies = React.useMemo(() => {
    return (companiesData || []).map((c: any) => ({
      id: c._id,
      name: c.companyName,
      joiningDate: c.joiningDate
        ? new Date(c.joiningDate).toISOString().split("T")[0]
        : "—",
      dialerLink: c.dialerLink,
      intId: c.intId,
      servers: c.noOfServers || 0,
      charges: c.serverCharges ?? 0,
      paidAmount: c.paidAmount || 0,
      password: c.password,
      renewalDate: c.renewalDate
        ? new Date(c.renewalDate).toISOString().split("T")[0]
        : "—",
      inactiveDate: c.inactiveDate
        ? new Date(c.inactiveDate).toISOString().split("T")[0]
        : "None",
      status: c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : "—",
      comment: c.comment,
      additionalComment: c?.additionalComment || "None",
      renewalRaw: c.renewalDate,
    }));
  }, [companiesData]);

  const filteredCompanies = React.useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    let filtered = allCompanies;

    if (status !== "All") {
      filtered = filtered.filter((c: any) => c.status === status);
    }

    if (paymentStatus === "Paid") {
      filtered = filtered.filter((c: any) => c.paidAmount >= c.charges);
    } else if (paymentStatus === "Not Paid") {
      filtered = filtered.filter((c: any) => c.paidAmount < c.charges);
    }

    if (!searchLower) return filtered;

    return filtered.filter(
      (c: any) =>
        c.name?.toLowerCase().includes(searchLower) ||
        (c.dialerLink && c.dialerLink.toLowerCase().includes(searchLower)) ||
        (c.intId && c.intId.toString().includes(searchLower)),
    );
  }, [status, paymentStatus, allCompanies, search]);

  /*
   * Renewal urgency is derived without mutating the source objects, and
   * `daysUntil` reads the clock at call time — the previous version captured a
   * `new Date()` in the render body, which invalidated this memo on every
   * single render.
   */
  const companies = React.useMemo(
    () =>
      filteredCompanies
        .map((c: any) => {
          const days = daysUntil(c.renewalRaw);

          let renewalStatus = "Upcoming";
          if (Number.isFinite(days)) {
            if (days <= 0) renewalStatus = "Passed";
            else if (days <= 3) renewalStatus = "Urgent";
            else if (days <= 5) renewalStatus = "Pending";
          }

          return { ...c, days, renewalStatus };
        })
        .sort((a: any, b: any) => a.days - b.days),
    [filteredCompanies],
  );

  /**
   * Urgency signalling is deliberately restrained: a hairline left rule on
   * every affected row, and a background wash ONLY on rows that need action
   * today. Tinting every bucket produced a muddy multi-colour wash across the
   * register instead of a single, legible signal.
   */
  const rowAccentClass = (renewalStatus: string) => {
    switch (renewalStatus) {
      case "Passed":
        return "border-l-2 border-l-destructive bg-destructive/[0.04]";
      case "Urgent":
        return "border-l-2 border-l-warning bg-warning/[0.06]";
      case "Pending":
        return "border-l-2 border-l-primary/40";
      default:
        return "border-l-2 border-l-transparent";
    }
  };

  const activeFilterCount =
    (search ? 1 : 0) +
    (status !== "Active" ? 1 : 0) +
    (paymentStatus !== "All" ? 1 : 0);

  const resetFilters = () => {
    setSearch("");
    setStatus("Active");
    setPaymentStatus("All");
  };

  const savePaidAmount = async (companyId: string) => {
    const newValue = localPaidAmounts[companyId];
    setSavingPaidAmounts((prev) => new Set([...prev, companyId]));

    try {
      await onPaidAmountChange(companyId, newValue);
    } catch (error) {
      console.error("Failed to update paid amount:", error);
    } finally {
      // Clear the draft either way so the row falls back to server truth.
      setLocalPaidAmounts((prev) => {
        const next = { ...prev };
        delete next[companyId];
        return next;
      });
      setSavingPaidAmounts((prev) => {
        const next = new Set(prev);
        next.delete(companyId);
        return next;
      });
    }
  };

  return (
    <div className="panel overflow-hidden">
      {/* ---------------- Toolbar ---------------- */}
      <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <h2 className="heading-2 text-foreground">Company register</h2>
          <p className="body-sm mt-1 text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${formatNumber(companies.length)} shown of ${formatNumber(allCompanies.length)}`}
            {" · "}
            select any cell to read its change history
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative">
            <label htmlFor="company-search" className="sr-only">
              Search companies
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="company-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 sm:w-56"
              placeholder="Name, link or ID…"
            />
          </div>

          <Select
            value={status}
            onValueChange={(value: "Active" | "Inactive" | "All") =>
              setStatus(value)
            }
          >
            <SelectTrigger className="w-full sm:w-[8.5rem]" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="All">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={paymentStatus}
            onValueChange={(value: "All" | "Paid" | "Not Paid") =>
              setPaymentStatus(value)
            }
          >
            <SelectTrigger className="w-full sm:w-[8.5rem]" aria-label="Filter by payment">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Payment</SelectLabel>
                <SelectItem value="All">All payments</SelectItem>
                <SelectItem value="Paid">Settled</SelectItem>
                <SelectItem value="Not Paid">Outstanding</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          )}

          <Button onClick={onAddClick} className="w-full sm:w-auto">
            Add company
          </Button>
        </div>
      </div>

      {/* ---------------- Table ---------------- */}
      <Table className="w-max min-w-full table-fixed">
        <colgroup>
          {COLUMNS.map((col) => (
            <col key={col.id} style={{ width: widths[col.id] }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {COLUMNS.map((col) => (
              <TableHead
                key={col.id}
                className={col.align === "right" ? "text-right" : undefined}
              >
                {col.label}
                <ColumnResizeHandle
                  columnLabel={col.label}
                  width={widths[col.id]}
                  minWidth={col.minWidth}
                  maxWidth={col.maxWidth}
                  onPointerDown={startResize(col.id)}
                  onNudge={(direction) => nudgeColumn(col.id, direction)}
                  onReset={() => resetColumn(col.id)}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableSkeleton rows={6} columns={COLUMNS.length} />
          ) : isError ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COLUMNS.length} className="whitespace-normal">
                <ErrorState
                  title="Couldn't load companies"
                  description="There was a problem fetching company data."
                  onRetry={refetch}
                />
              </TableCell>
            </TableRow>
          ) : companies.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COLUMNS.length} className="whitespace-normal">
                <EmptyState
                  icon={Building2}
                  title="No companies found"
                  description={
                    activeFilterCount > 0
                      ? "No companies match the current filters."
                      : "Add your first company to start tracking renewals and charges."
                  }
                  action={
                    activeFilterCount > 0 ? (
                      <Button variant="outline" size="sm" onClick={resetFilters}>
                        Clear filters
                      </Button>
                    ) : (
                      <Button onClick={onAddClick} size="sm">
                        Add company
                      </Button>
                    )
                  }
                />
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company: any) => {
              const isSaving = savingPaidAmounts.has(company.id);
              const hasDraft = localPaidAmounts[company.id] !== undefined;
              const settled =
                company.charges > 0 && company.paidAmount >= company.charges;

              return (
                <TableRow
                  key={company.id}
                  className={cn("group", rowAccentClass(company.renewalStatus))}
                >
                  <LoggableCell
                    companyId={company.id}
                    columnId="name"
                    onFieldClick={onFieldClick}
                  >
                    <p className="truncate font-medium text-foreground" title={company.name}>
                      {company.name}
                    </p>
                    <p className="mono-id truncate text-muted-foreground">
                      ID {company.intId}
                    </p>
                  </LoggableCell>

                  <LoggableCell
                    companyId={company.id}
                    columnId="renewalDate"
                    onFieldClick={onFieldClick}
                  >
                    <span className="tnum whitespace-nowrap text-muted-foreground">
                      {company.renewalDate}
                    </span>
                    {Number.isFinite(company.days) && company.days <= 5 && (
                      <span
                        className={cn(
                          "tnum mt-0.5 block text-[10px] font-semibold",
                          company.days <= 0
                            ? "text-destructive"
                            : company.days <= 3
                              ? "text-warning"
                              : "text-muted-foreground",
                        )}
                      >
                        {company.days <= 0
                          ? `${Math.abs(company.days)}d overdue`
                          : `${company.days}d left`}
                      </span>
                    )}
                  </LoggableCell>

                  <LoggableCell
                    companyId={company.id}
                    columnId="dialerLink"
                    onFieldClick={onFieldClick}
                  >
                    <span className="inline-flex max-w-full items-center gap-1.5">
                      <span
                        className="truncate text-muted-foreground"
                        title={company.dialerLink}
                      >
                        {company.dialerLink || "—"}
                      </span>
                      {company.dialerLink && (
                        <a
                          href={company.dialerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="shrink-0 rounded-[3px] p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                          aria-label={`Open dialer link for ${company.name}`}
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </span>
                  </LoggableCell>

                  <LoggableCell
                    companyId={company.id}
                    columnId="password"
                    onFieldClick={onFieldClick}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="mono-id truncate text-muted-foreground">
                        {company.password || "—"}
                      </span>
                      {company.password ? (
                        <CopyButton
                          value={company.password}
                          label={`Copy password for ${company.name}`}
                        />
                      ) : null}
                    </span>
                  </LoggableCell>

                  <LoggableCell
                    companyId={company.id}
                    columnId="servers"
                    onFieldClick={onFieldClick}
                    className="text-right"
                  >
                    <span className="tnum">{formatNumber(company.servers)}</span>
                  </LoggableCell>

                  <LoggableCell
                    companyId={company.id}
                    columnId="charges"
                    onFieldClick={onFieldClick}
                    className="text-right"
                  >
                    <span className="tnum font-medium">
                      {formatCurrency(company.charges)}
                    </span>
                  </LoggableCell>

                  {/* Inline payment editor — intentionally not a loggable cell */}
                  <TableCell>
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <label
                        htmlFor={`paid-${company.id}`}
                        className="sr-only"
                      >
                        Paid amount for {company.name}
                      </label>
                      <Input
                        id={`paid-${company.id}`}
                        type="number"
                        value={
                          hasDraft
                            ? localPaidAmounts[company.id]
                            : company.paidAmount
                        }
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value) || 0;
                          setLocalPaidAmounts((prev) => ({
                            ...prev,
                            [company.id]: newValue,
                          }));
                        }}
                        className="tnum h-8 w-24 text-right"
                        min="0"
                        step="0.01"
                      />
                      {hasDraft && (
                        <Button
                          size="sm"
                          disabled={isSaving}
                          onClick={() => void savePaidAmount(company.id)}
                        >
                          {isSaving ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={settled ? "success" : "warning"}>
                        <BadgeDot />
                        {settled ? "Settled" : "Outstanding"}
                      </Badge>
                      {onFieldClick && (
                        <button
                          type="button"
                          onClick={() => onFieldClick(company.id, "paidAmount")}
                          className="rounded-[2px] text-[10px] font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          History
                        </button>
                      )}
                    </div>
                  </TableCell>

                  <LoggableCell
                    companyId={company.id}
                    columnId="status"
                    onFieldClick={onFieldClick}
                  >
                    <Badge
                      variant={company.status === "Active" ? "success" : "neutral"}
                    >
                      <BadgeDot />
                      {company.status}
                    </Badge>
                  </LoggableCell>

                  <LoggableCell
                    companyId={company.id}
                    columnId="inactiveDate"
                    onFieldClick={onFieldClick}
                    className="text-muted-foreground"
                  >
                    <span className="tnum whitespace-nowrap">
                      {company.inactiveDate}
                    </span>
                  </LoggableCell>

                  <LoggableCell
                    companyId={company.id}
                    columnId="comment"
                    onFieldClick={onFieldClick}
                    className="text-muted-foreground"
                  >
                    <span className="block truncate" title={company.comment}>
                      {company.comment || "—"}
                    </span>
                  </LoggableCell>

                  <LoggableCell
                    companyId={company.id}
                    columnId="additionalComment"
                    onFieldClick={onFieldClick}
                    className="text-muted-foreground"
                  >
                    <span
                      className="block truncate"
                      title={company?.additionalComment}
                    >
                      {company?.additionalComment}
                    </span>
                  </LoggableCell>

                  <LoggableCell
                    companyId={company.id}
                    columnId="joiningDate"
                    onFieldClick={onFieldClick}
                    className="text-muted-foreground"
                  >
                    <span className="tnum whitespace-nowrap">
                      {company.joiningDate}
                    </span>
                  </LoggableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEditClick(company)}
                      aria-label={`Edit ${company.name}`}
                    >
                      <Edit2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
