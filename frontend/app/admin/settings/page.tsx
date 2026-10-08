"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHealth } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";

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
 * Timestamps are formatted from their ISO parts rather than through
 * `toLocaleString`: the server pass runs in UTC and the browser may not, and a
 * locale-dependent string would desync hydration.
 */
function formatTimestamp(raw: unknown): string {
  if (typeof raw !== "string" || !raw) return EM_DASH;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return EM_DASH;

  const [datePart, timePart = ""] = parsed.toISOString().split("T");
  const [year, month, day] = datePart.split("-");

  return `${day} ${MONTHS[Number(month) - 1] ?? month} ${year}, ${timePart.slice(0, 8)} UTC`;
}

/** `11232` → `3h 7m 12s`, trimming empty leading units. */
function humaniseUptime(raw: unknown): string {
  const seconds = Number(raw);

  if (!Number.isFinite(seconds) || seconds < 0) return EM_DASH;

  const whole = Math.floor(seconds);
  const days = Math.floor(whole / 86400);
  const hours = Math.floor((whole % 86400) / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  // Below a minute the seconds are the only meaningful figure.
  if (parts.length === 0) return `${secs}s`;
  if (days === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

function capitalise(raw: unknown): string {
  if (typeof raw !== "string" || !raw) return EM_DASH;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function text(value: unknown): string {
  if (value === null || value === undefined) return EM_DASH;

  const asString = String(value).trim();
  if (!asString || asString === "null" || asString === "undefined") {
    return EM_DASH;
  }

  return asString;
}

function HealthRow({
  label,
  children,
  last = false,
}: Readonly<{
  label: string;
  children: React.ReactNode;
  last?: boolean;
}>) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-1.5 px-4 py-4 sm:grid-cols-[13rem_minmax(0,1fr)]",
        !last && "border-b border-border",
      )}
    >
      <dt className="micro-label sm:pt-0.5">{label}</dt>
      <dd className="min-w-0 text-foreground">{children}</dd>
    </div>
  );
}

export default function SystemStatusPage() {
  const { health, isLoading, isError, isFetching, dataUpdatedAt, refetch } =
    useHealth();

  const database = health?.database;
  const isOperational = health?.status === "ok";
  const isDegraded = health?.status === "degraded";
  const databaseConnected = database?.connected === true;

  return (
    <AppShell
      title="System status"
      description="Live read-only view of the API and its database connection. Values are polled every 30 seconds."
      actions={
        <Button
          variant="outline"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={cn("size-4", isFetching && "animate-spin")}
            aria-hidden="true"
          />
          {isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      }
    >
      <div className="panel overflow-hidden rounded-md">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border px-4 py-3">
          <p className="micro-label">Service health</p>
          <p className="tnum text-[11px] text-muted-foreground">
            {dataUpdatedAt
              ? `Last checked ${formatTimestamp(new Date(dataUpdatedAt).toISOString())}`
              : "Awaiting first reading"}
          </p>
        </div>

        {isError && !health ? (
          <ErrorState
            title="Couldn't reach the health endpoint"
            description="The API did not return a health report. Check that the backend is running and try again."
            onRetry={() => void refetch()}
          />
        ) : isLoading && !health ? (
          <dl>
            {[0, 1, 2, 3, 4, 5].map((row) => (
              <div
                key={row}
                className="grid grid-cols-1 gap-x-6 gap-y-2 border-b border-border px-4 py-4 last:border-b-0 sm:grid-cols-[13rem_minmax(0,1fr)]"
              >
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="h-3.5 w-40" />
              </div>
            ))}
          </dl>
        ) : (
          <dl>
            <HealthRow label="API status">
              <Badge
                variant={
                  isOperational
                    ? "success"
                    : isDegraded
                      ? "warning"
                      : "neutral"
                }
              >
                {isOperational
                  ? "Operational"
                  : isDegraded
                    ? "Degraded"
                    : text(health?.status)}
              </Badge>
            </HealthRow>

            <HealthRow label="Database connection">
              <Badge variant={databaseConnected ? "success" : "destructive"}>
                {databaseConnected ? "Connected" : "Disconnected"}
              </Badge>
            </HealthRow>

            <HealthRow label="Database state">
              <span className="body">{text(database?.state)}</span>
            </HealthRow>

            <HealthRow label="Database name">
              <span className="mono-id text-foreground">
                {text(database?.name)}
              </span>
            </HealthRow>

            <HealthRow label="Uptime">
              <span className="tnum font-medium text-foreground">
                {humaniseUptime(health?.uptimeSeconds)}
              </span>
              {Number.isFinite(Number(health?.uptimeSeconds)) && (
                <span className="tnum ml-2 text-[11px] text-muted-foreground">
                  · {Math.floor(Number(health?.uptimeSeconds))} s
                </span>
              )}
            </HealthRow>

            <HealthRow label="Version">
              <span className="mono-id text-foreground">
                {text(health?.version)}
              </span>
            </HealthRow>

            <HealthRow label="Environment">
              <span className="body">{capitalise(health?.environment)}</span>
            </HealthRow>

            <HealthRow label="Reported at" last>
              <span className="tnum text-muted-foreground">
                {formatTimestamp(health?.timestamp)}
              </span>
            </HealthRow>
          </dl>
        )}
      </div>
    </AppShell>
  );
}
