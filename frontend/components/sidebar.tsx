"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Building2,
  BellRing,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  User,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import {
  closeMobileSidebar,
  useSidebarState,
} from "@/hooks/useSidebar";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Companies", icon: Building2, href: "/dashboard/companies" },
  { name: "Renewal Alerts", icon: BellRing, href: "/renewals" },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [adminItems, setAdminItems] = React.useState<{ name: string; icon: any; href: string }[]>(
    [],
  );

  const pathname = usePathname();
  const { mobileOpen } = useSidebarState();

  const { user } = useMe();

  React.useEffect(() => {
    if (user?.role?.name === "admin") {
      setAdminItems([
        { name: "Manage Users", icon: User, href: "/admin/users" },
        { name: "Logs", icon: History, href: "/logs" },
      ]);
    }
  }, [user?.role?.name]);

  // Close the mobile drawer whenever the route changes.
  React.useEffect(() => {
    closeMobileSidebar();
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.removeProperty("overflow");
    }
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [mobileOpen]);

  // Close on Escape.
  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileSidebar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const renderNavGroup = (label: string, items: typeof navItems) => (
    <div>
      {!isCollapsed && (
        <p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-white/30 uppercase">
          {label}
        </p>
      )}
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                isActive
                  ? "bg-white text-black"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-black" : "text-white/60 group-hover:text-white",
                )}
              />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSidebar}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-screen transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <motion.div
          initial={false}
          animate={{ width: isCollapsed ? 80 : 260 }}
          className={cn(
            "flex h-full flex-col overflow-hidden border-r border-white/10 bg-black text-white",
          )}
          id="app-sidebar"
          aria-label="Primary navigation"
        >
          {/* Logo Section */}
          <div className="mb-4 flex h-20 shrink-0 items-center px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-xl font-bold tracking-tight whitespace-nowrap"
                  >
                    DialerFlow
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-3">
            {renderNavGroup("Main", navItems)}
            {adminItems?.length ? renderNavGroup("Admin", adminItems) : null}
          </div>

          {/* Collapse Toggle (desktop only) */}
          <div className="hidden border-t border-white/10 p-4 lg:block">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isCollapsed}
              aria-controls="app-sidebar"
              className="flex w-full items-center justify-center rounded-xl p-2 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
