"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Every heading in this system is left-aligned. Centred titles are reserved
 * for the standalone sign-in door and nowhere else.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: Readonly<PageHeaderProps>) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"
          >
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb.label}>
                {i > 0 && (
                  <ChevronRight className="size-3 shrink-0 opacity-50" />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="rounded-[2px] transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <h1 className="heading-1 text-foreground sm:text-[1.75rem]">{title}</h1>

        {description && (
          <p className="body mt-2 max-w-2xl text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {actions}
        </div>
      )}
    </header>
  );
}
