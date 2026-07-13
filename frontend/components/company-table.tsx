"use client";

import * as React from "react";
import { Copy, Edit2, ExternalLink, Loader2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/hooks/useQueries";
import { Button } from "./ui/button";

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
import { Badge } from "./ui/badge";
import {
  ColumnResizeHandle,
  useResizableColumns,
  type ResizableColumnDef,
} from "./ui/resizable-table";
import { TableSkeleton } from "./shared/table-skeleton";
import { EmptyState } from "./shared/empty-state";
import { ErrorState } from "./shared/error-state";

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

const COLUMNS: (ResizableColumnDef & { label: string; align?: "right" })[] = [
  { id: "name", width: 220, minWidth: 170, label: "Company Name" },
  { id: "renewalDate", width: 130, minWidth: 110, label: "Renewal Date" },
  { id: "dialerLink", width: 210, minWidth: 140, label: "Dialer Link" },
  { id: "password", width: 130, minWidth: 90, label: "Password" },
  { id: "servers", width: 100, minWidth: 80, label: "Servers" },
  { id: "charges", width: 110, minWidth: 90, label: "Charges" },
  { id: "paidAmount", width: 190, minWidth: 170, label: "Paid Amount" },
  { id: "status", width: 110, minWidth: 90, label: "Status" },
  { id: "inactiveDate", width: 130, minWidth: 100, label: "Inactive Date" },
  { id: "comment", width: 220, minWidth: 140, label: "Renewal Details" },
  { id: "additionalComment", width: 220, minWidth: 140, label: "Additional Comment" },
  { id: "joiningDate", width: 130, minWidth: 100, label: "Joining Date" },
  { id: "actions", width: 100, minWidth: 90, maxWidth: 160, label: "Actions", align: "right" },
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
          "cursor-pointer transition-colors hover:bg-primary/5 focus-visible:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
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
  const [localPaidAmounts, setLocalPaidAmounts] = React.useState<Record<string, number>>({});
  const [originalPaidAmounts, setOriginalPaidAmounts] = React.useState<Record<string, number>>({});
  const [savingPaidAmounts, setSavingPaidAmounts] = React.useState<Set<string>>(new Set());
  const today = new Date();

  const { companies: companiesData, isLoading, isError, refetch } =
    useCompanies();

  const { widths, startResize, nudgeColumn, resetColumn } =
    useResizableColumns(COLUMNS);

  const allCompanies = React.useMemo(() => {
    return (companiesData || []).map((c: any) => ({
      id: c._id,
      name: c.companyName,
      joiningDate: new Date(c.joiningDate).toISOString().split("T")[0],
      dialerLink: c.dialerLink,
      intId: c.intId,
      servers: c.noOfServers || 0,
      charges: c.serverCharges,
      paidAmount: c.paidAmount || 0,
      password: c.password,
      renewalDate: new Date(c.renewalDate).toISOString().split("T")[0],
      inactiveDate: c.inactiveDate
        ? new Date(c.inactiveDate)?.toISOString()?.split("T")[0]
        : "None",
      status: c.status.charAt(0).toUpperCase() + c.status.slice(1),
      comment: c.comment,
      additionalComment: c?.additionalComment || "None",
    }));
  }, [companiesData]);

  const filteredCompanies = React.useMemo(() => {
    const searchLower = search.toLowerCase();
    let filtered = allCompanies;

    // Filter by status
    if (status !== "All") {
      filtered = filtered.filter((c: any) => c.status === status);
    }

    // Filter by payment status
    if (paymentStatus === "Paid") {
      filtered = filtered.filter((c: any) => c.paidAmount >= c.charges);
    } else if (paymentStatus === "Not Paid") {
      filtered = filtered.filter((c: any) => c.paidAmount < c.charges);
    }

    // Filter by search
    return filtered.filter(
      (c: any) =>
        c.name.toLowerCase().includes(searchLower) ||
        (c.dialerLink && c.dialerLink.toLowerCase().includes(searchLower)) ||
        (c.intId && c.intId.toString().includes(search))
    );
  }, [status, paymentStatus, allCompanies, search]);

  const companies = React.useMemo(() => {
    const companies = filteredCompanies
      .map((c: any) => {
        const renewalDate = new Date(c.renewalDate);

        const diffTime = renewalDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status = "Upcoming";
        if (diffDays <= 3 && diffDays > 0) status = "Urgent";
        else if (diffDays <= 5 && diffDays > 0) status = "Pending";
        else if (diffDays <= 0) status = "Passed";

        c.renewalStatus = status;
        c.days = diffDays;

        return c;
      })
      .sort((a: any, b: any) => a.days - b.days);

    return companies;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCompanies, today]);

  const rowAccentClass = (renewalStatus: string) => {
    switch (renewalStatus) {
      case "Passed":
        return "border-l-2 border-l-destructive bg-destructive/[0.15] hover:bg-destructive/[0.3]";
      case "Urgent":
        return "border-l-2 border-l-amber-500 bg-amber-500/[0.15] hover:bg-amber-500/[0.3]";
      case "Pending":
        return "border-l-2 border-l-blue-500 bg-blue-500/[0.15] hover:bg-blue-500/[0.4]";
      default:
        return "border-l-2 border-l-transparent";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          Companies Overview
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-48"
            placeholder="Search..."
          ></Input>
          <div className="flex gap-2">
            <Select
              value={status}
              onValueChange={(value: "Active" | "Inactive" | "All") =>
                setStatus(value)
              }
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="All">All</SelectItem>
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
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Payment</SelectLabel>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Not Paid">Not Paid</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onAddClick} className="w-full sm:w-auto">
            Add Company
          </Button>
        </div>
      </div>

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
                  description="There was a problem fetching company data. Please try again."
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
                    search || status !== "All" || paymentStatus !== "All"
                      ? "No companies match your current filters. Try adjusting your search or filters."
                      : "Get started by adding your first company."
                  }
                  action={
                    !search && status === "All" && paymentStatus === "All" ? (
                      <Button onClick={onAddClick} size="sm">
                        Add Company
                      </Button>
                    ) : undefined
                  }
                />
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company: any) => (
              <TableRow
                key={company.id}
                className={cn("group", rowAccentClass(company.renewalStatus))}
              >
                <LoggableCell
                  companyId={company.id}
                  columnId="name"
                  onFieldClick={onFieldClick}
                >
                  <p className="truncate font-semibold" title={company.name}>
                    {company.name}
                  </p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    ID: {company.intId}
                  </p>
                </LoggableCell>
                <LoggableCell
                  companyId={company.id}
                  columnId="renewalDate"
                  onFieldClick={onFieldClick}
                  className="text-muted-foreground"
                >
                  {company.renewalDate}
                </LoggableCell>
                <LoggableCell
                  companyId={company.id}
                  columnId="dialerLink"
                  onFieldClick={onFieldClick}
                >
                  <span
                    className="inline-flex max-w-full items-center gap-1.5 truncate font-medium text-muted-foreground"
                    title={company.dialerLink}
                  >
                    <span className="truncate">{company.dialerLink}</span>
                    {company.dialerLink && (
                      <a
                        href={company.dialerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={`Open dialer link for ${company.name}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </span>
                </LoggableCell>
                <LoggableCell
                  companyId={company.id}
                  columnId="password"
                  onFieldClick={onFieldClick}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{company.password}</span>
                    {company.password ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                            void navigator.clipboard.writeText(company.password).catch(
                              (error) => console.error("Copy failed:", error),
                            );
                          } else {
                            console.warn("Clipboard API not available.");
                          }
                        }}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={`Copy password for ${company.name}`}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </LoggableCell>
                <LoggableCell
                  companyId={company.id}
                  columnId="servers"
                  onFieldClick={onFieldClick}
                >
                  <span className="font-mono">{company.servers}</span>
                </LoggableCell>
                <LoggableCell
                  companyId={company.id}
                  columnId="charges"
                  onFieldClick={onFieldClick}
                >
                  <span className="font-semibold">${company.charges}</span>
                </LoggableCell>
                <TableCell>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <Input
                      type="number"
                      value={localPaidAmounts[company.id] !== undefined ? localPaidAmounts[company.id] : company.paidAmount}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        setOriginalPaidAmounts((prev) => {
                          if (prev[company.id] === undefined) {
                            return { ...prev, [company.id]: company.paidAmount };
                          }
                          return prev;
                        });
                        setLocalPaidAmounts((prev) => ({
                          ...prev,
                          [company.id]: newValue,
                        }));
                      }}
                      className="w-20"
                      min="0"
                      step="0.01"
                    />
                    {localPaidAmounts[company.id] !== undefined && (
                      <Button
                        size="sm"
                        onClick={async () => {
                          const newValue = localPaidAmounts[company.id];
                          setSavingPaidAmounts((prev) => new Set([...prev, company.id]));
                          try {
                            await onPaidAmountChange(company.id, newValue);
                            setLocalPaidAmounts((prev) => {
                              const updated = { ...prev };
                              delete updated[company.id];
                              return updated;
                            });
                            setOriginalPaidAmounts((prev) => {
                              const updated = { ...prev };
                              delete updated[company.id];
                              return updated;
                            });
                          } catch (error) {
                            setLocalPaidAmounts((prev) => {
                              const updated = { ...prev };
                              delete updated[company.id];
                              return updated;
                            });
                            setOriginalPaidAmounts((prev) => {
                              const updated = { ...prev };
                              delete updated[company.id];
                              return updated;
                            });
                            console.error("Failed to update paid amount:", error);
                          } finally {
                            setSavingPaidAmounts((prev) => {
                              const updated = new Set(prev);
                              updated.delete(company.id);
                              return updated;
                            });
                          }
                        }}
                        disabled={savingPaidAmounts.has(company.id)}
                      >
                        {savingPaidAmounts.has(company.id) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                    )}
                  </div>
                  {onFieldClick && (
                    <button
                      type="button"
                      onClick={() => onFieldClick(company.id, "paidAmount")}
                      className="mt-1 text-[10px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      View payment history
                    </button>
                  )}
                </TableCell>
                <LoggableCell
                  companyId={company.id}
                  columnId="status"
                  onFieldClick={onFieldClick}
                >
                  <Badge variant={company.status === "Active" ? "success" : "neutral"}>
                    {company.status}
                  </Badge>
                </LoggableCell>
                <LoggableCell
                  companyId={company.id}
                  columnId="inactiveDate"
                  onFieldClick={onFieldClick}
                  className="text-muted-foreground"
                >
                  {company.inactiveDate}
                </LoggableCell>
                <LoggableCell
                  companyId={company.id}
                  columnId="comment"
                  onFieldClick={onFieldClick}
                  className="text-muted-foreground"
                >
                  <span className="truncate" title={company.comment}>
                    {company.comment}
                  </span>
                </LoggableCell>
                <LoggableCell
                  companyId={company.id}
                  columnId="additionalComment"
                  onFieldClick={onFieldClick}
                  className="text-muted-foreground"
                >
                  <span className="truncate" title={company?.additionalComment}>
                    {company?.additionalComment}
                  </span>
                </LoggableCell>
                <LoggableCell
                  companyId={company.id}
                  columnId="joiningDate"
                  onFieldClick={onFieldClick}
                  className="text-muted-foreground"
                >
                  {company.joiningDate}
                </LoggableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEditClick(company)}
                      aria-label={`Edit ${company.name}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
