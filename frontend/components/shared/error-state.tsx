"use client";

import * as React from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again in a moment.",
  onRetry,
  className,
}: Readonly<ErrorStateProps>) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-3 px-5 py-14 sm:px-6",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-md border border-destructive/30 bg-destructive/8">
        <AlertTriangle className="size-4 text-destructive" />
      </span>
      <div className="space-y-1">
        <p className="heading-3 text-foreground">{title}</p>
        <p className="body max-w-md text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-1" onClick={onRetry}>
          <RotateCw className="size-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
