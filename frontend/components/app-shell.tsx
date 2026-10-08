"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { PageHeader, type Breadcrumb } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

interface AppShellProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  /** Optional right-hand column (rendered beside content from xl up). */
  aside?: React.ReactNode;
  children: React.ReactNode;
  /** Drop the max-width cap for wide, column-heavy tables. */
  bleed?: boolean;
  contentClassName?: string;
}

/**
 * The single structural wrapper for every authenticated screen.
 *
 * Consolidating the sidebar / navbar / page-header triplet here means pages
 * carry layout intent only, and the console cannot drift out of alignment
 * from one route to the next.
 */
export function AppShell({
  title,
  description,
  breadcrumbs,
  actions,
  aside,
  children,
  bleed = false,
  contentClassName,
}: Readonly<AppShellProps>) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <div
          className={cn(
            "w-full flex-1 px-5 py-7 sm:px-8 sm:py-9 lg:px-10",
            !bleed && "mx-auto max-w-[1500px]",
            contentClassName,
          )}
        >
          <PageHeader
            title={title}
            description={description}
            breadcrumbs={breadcrumbs}
            actions={actions}
          />

          {aside ? (
            <div className="mt-8 flex flex-col gap-8 xl:flex-row xl:items-start">
              <div className="min-w-0 flex-1">{children}</div>
              <div className="w-full shrink-0 xl:w-[21rem]">{aside}</div>
            </div>
          ) : (
            <div className="mt-8">{children}</div>
          )}
        </div>
      </main>
    </div>
  );
}
