"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: Readonly<EmptyStateProps>) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 px-5 py-14 sm:px-6",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-md border border-border bg-surface-alt">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <div className="space-y-1">
        <p className="heading-3 text-foreground">{title}</p>
        {description && (
          <p className="body max-w-md text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
