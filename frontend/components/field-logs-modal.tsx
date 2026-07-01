"use client";

import * as React from "react";
import { Clock, User, ArrowLeft, ArrowRight, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

function formatLogValue(value: unknown) {
  if (value === null || value === undefined || value === "null") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
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
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Field history: {fieldName}
          </DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Loading change history…"
              : `Showing ${logs.length} of ${total} log${total === 1 ? "" : "s"} (max 7 per page)`}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Couldn't load field history"
              description="There was a problem fetching logs for this field."
              onRetry={onRetry}
            />
          ) : logs.length === 0 ? (
            <EmptyState
              icon={History}
              title="No changes recorded"
              description={`No audit logs found for ${fieldName} on this company yet.`}
            />
          ) : (
            logs.map((log) => (
              <div
                key={log._id}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={actionVariant(log.action)}>
                      {log.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {log.field}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background/60 p-2.5">
                    <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                      Before
                    </p>
                    <p className="font-mono text-xs break-all text-muted-foreground line-through">
                      {formatLogValue(log.oldValue)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/60 p-2.5">
                    <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                      After
                    </p>
                    <p className="font-mono text-xs font-medium break-all text-foreground">
                      {formatLogValue(log.newValue)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {log.changedBy?.name ?? "Unknown"}
                    {log.changedBy?.email ? ` · ${log.changedBy.email}` : ""}
                  </span>
                </div>
              </div>
            ))
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
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
