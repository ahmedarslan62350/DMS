"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Building2,
  BellRing,
  MessageSquare,
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

  const { user } = useMe();

  React.useEffect(() => {
    if (user?.role?.name === "admin") {
      setAdminItems([
        { name: "Manage Users", icon: User, href: "/admin/users" },
        { name: "Logs", icon: History, href: "/logs" },
      ]);
    }
  }, [user?.role?.name]);

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className={cn(
        "h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out",
        "bg-black text-white border-r border-white/10",
      )}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-xl tracking-tight whitespace-nowrap"
              >
                DialerFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-6">
        <div>
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
              Main
            </p>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "bg-white text-black"
                      : "text-white/60 hover:text-white hover:bg-white/5",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive
                        ? "text-black"
                        : "text-white/60 group-hover:text-white",
                    )}
                  />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {adminItems?.length ? (
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                Admin
              </p>
            )}
            <nav className="space-y-1">
              {adminItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                      isActive
                        ? "bg-white text-black"
                        : "text-white/60 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 shrink-0",
                        isActive
                          ? "text-black"
                          : "text-white/60 group-hover:text-white",
                      )}
                    />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}
      </div>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </motion.div>
  );
}
