"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Building2,
  BellRing,
  History,
  Users,
  ShieldCheck,
  ServerCog,
  ChevronsLeft,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import {
  closeMobileSidebar,
  setSidebarCollapsed,
  useSidebarState,
} from "@/hooks/useSidebar";

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const operationsNav: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Companies", icon: Building2, href: "/dashboard/companies" },
  { name: "Renewals", icon: BellRing, href: "/renewals" },
];

const adminNav: NavItem[] = [
  { name: "Users", icon: Users, href: "/admin/users" },
  { name: "Roles & Permissions", icon: ShieldCheck, href: "/admin/permissions" },
  { name: "Audit Log", icon: History, href: "/logs" },
  { name: "System", icon: ServerCog, href: "/admin/settings" },
];

const SECTION_LABELS: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/companies": "Companies",
  "/renewals": "Renewals",
  "/logs": "Audit log",
  "/admin/users": "Users",
  "/admin/permissions": "Roles & permissions",
  "/admin/settings": "System",
};

export function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, collapsed } = useSidebarState();
  const { user } = useMe();

  const isAdmin = user?.role?.name === "admin";

  // Close the mobile drawer on navigation.
  React.useEffect(() => {
    closeMobileSidebar();
  }, [pathname]);

  // Lock background scroll while the drawer is open.
  React.useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileSidebar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const renderGroup = (label: string, items: NavItem[]) => (
    <div className="px-3">
      {!collapsed && <p className="rail-label mb-2 px-2">{label}</p>}
      {collapsed && <div className="mx-2 mb-2 h-px bg-rail-border" />}
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.name : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-2 py-2 text-[13px] font-medium transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-rail-active text-white"
                  : "text-rail-muted hover:bg-rail-hover hover:text-white",
              )}
            >
              {/* Active marker: a hard 2px rule, never a glow */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-white transition-opacity",
                  isActive ? "opacity-100" : "opacity-0",
                )}
              />
              <item.icon className="size-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile scrim */}
      <div
        onClick={closeMobileSidebar}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-[#09090b]/50 transition-opacity duration-200 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div
          id="app-sidebar"
          aria-label="Primary navigation"
          className={cn(
            "flex h-full flex-col bg-rail text-rail-foreground transition-[width] duration-200 ease-out",
            collapsed ? "w-[68px]" : "w-[264px]",
          )}
        >
          {/* Wordmark */}
          <div
            className={cn(
              "flex h-16 shrink-0 items-center gap-3 border-b border-rail-border",
              collapsed ? "justify-center px-0" : "px-5",
            )}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-[3px] bg-white font-mono text-[11px] leading-none font-bold tracking-tight text-[#0b0b0d]">
              DF
            </span>
            {!collapsed && (
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[15px] leading-tight font-semibold tracking-[-0.02em] text-white">
                  DialerFlow
                </span>
                <span className="text-[9px] leading-tight font-semibold tracking-[0.14em] text-rail-muted uppercase">
                  Management Portal
                </span>
              </span>
            )}
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar-rail flex-1 space-y-6 overflow-y-auto py-5">
            {renderGroup("Operations", operationsNav)}
            {isAdmin && renderGroup("Administration", adminNav)}
          </div>

          {/* Footer controls */}
          <div className="shrink-0 border-t border-rail-border p-3">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              aria-controls="app-sidebar"
              className={cn(
                "hidden w-full items-center gap-3 rounded-md px-2 py-2 text-[12px] font-medium text-rail-muted transition-colors hover:bg-rail-hover hover:text-white lg:flex",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70",
                collapsed && "justify-center px-0",
              )}
            >
              <ChevronsLeft
                className={cn(
                  "size-4 shrink-0 transition-transform duration-200",
                  collapsed && "rotate-180",
                )}
              />
              {!collapsed && <span>Collapse</span>}
            </button>

            {/* Mobile-only close affordance */}
            <button
              type="button"
              onClick={closeMobileSidebar}
              aria-label="Close navigation"
              className="flex w-full items-center justify-center gap-3 rounded-md px-2 py-2 text-[12px] font-medium text-rail-muted transition-colors hover:bg-rail-hover hover:text-white lg:hidden"
            >
              <X className="size-4" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export { SECTION_LABELS };
