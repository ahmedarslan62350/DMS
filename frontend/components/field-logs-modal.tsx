"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, History } from "lucide-react";
import { Badge, BadgeDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatAuditValue, formatDateTime } from "@/lib/helpers";

interface Log {
  _id: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  action: "create" | "update" | "delete";
  changedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface FieldLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldName: string;
  logs: Log[];
  total: number;
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const actionVariant = (action: Log["action"]) => {
  switch (action) {
    case "create":
      return "success" as const;
    case "delete":
      return "destructive" as const;
    default:
      return "default" as const;
  }
};

/**
 * A field's change history, presented as a flat ledger: one hairline row per
 * revision, with the before/after values set in tabular type so they line up
 * down the column.
 */
export function FieldLogsModal({
  isOpen,
  onClose,
  fieldName,
  logs,
  total,
  page,
  pages,
  onPageChange,
  isLoading,
  isError = false,
  onRetry,
}: Readonly<FieldLogsModalProps>) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Change history</DialogTitle>
          <DialogDescription>
            {fieldName}
            {!isLoading && !isError && (
              <>
                {" · "}
                {total} revision{total === 1 ? "" : "s"} recorded
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Couldn't load field history"
              description="There was a problem fetching revisions for this field."
              onRetry={onRetry}
            />
          ) : logs.length === 0 ? (
            <EmptyState
              icon={History}
              title="No changes recorded"
              description={`Nothing has been changed for ${fieldName} yet.`}
            />
          ) : (
            <ul>
              {logs.map((log) => (
                <li
                  key={log._id}
                  className="border-b border-border px-5 py-4 last:border-b-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={actionVariant(log.action)}>
                      <BadgeDot />
                      {log.action}
                    </Badge>
                    <span className="tnum text-[11px] text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border sm:grid-cols-2">
                    <div className="bg-surface px-3 py-2.5">
                      <p className="micro-label">Before</p>
                      <p className="mono-id mt-1.5 break-all text-muted-foreground line-through">
                        {formatAuditValue(log.oldValue)}
                      </p>
                    </div>
                    <div className="bg-surface px-3 py-2.5">
                      <p className="micro-label">After</p>
                      <p className="mono-id mt-1.5 break-all font-medium text-foreground">
                        {formatAuditValue(log.newValue)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-2.5 truncate text-[11px] text-muted-foreground">
                    {log.changedBy?.name ?? "Unknown"}
                    {log.changedBy?.email ? ` · ${log.changedBy.email}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DialogBody>

        {pages > 1 && !isLoading && !isError && (
          <DialogFooter className="justify-between sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ArrowLeft className="size-3.5" />
              Previous
            </Button>
            <span className="tnum text-[12px] text-muted-foreground">
              Page {page} of {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
            >
              Next
              <ArrowRight className="size-3.5" />
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
