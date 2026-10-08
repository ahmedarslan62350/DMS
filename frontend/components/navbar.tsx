"use client";

import * as React from "react";
import { Moon, Sun, LogOut, Menu, ChevronDown } from "lucide-react";
import { useTheme } from "./theme-provider";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/hooks/useMe";
import { toggleMobileSidebar } from "@/hooks/useSidebar";
import { TokenStorage } from "@/lib/helpers";
import { SECTION_LABELS } from "./sidebar";
import { cn } from "@/lib/utils";

/**
 * Top bar. Deliberately sparse: current location on the left, session
 * controls on the right. No fake search box and no bell with a hardcoded
 * unread dot — decoration that lies about state is worse than an empty bar.
 */
export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user } = useMe();
  const menuRef = React.useRef<HTMLDivElement>(null);

  const sectionLabel = React.useMemo(() => {
    if (SECTION_LABELS[pathname]) return SECTION_LABELS[pathname];
    const match = Object.keys(SECTION_LABELS)
      .filter((key) => pathname.startsWith(key))
      .sort((a, b) => b.length - a.length)[0];
    return match ? SECTION_LABELS[match] : "Portal";
  }, [pathname]);

  // Dismiss the menu on outside click / Escape.
  React.useEffect(() => {
    if (!isProfileOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsProfileOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isProfileOpen]);

  const handleLogout = () => {
    // Clear the session for real: token first, then the cached identity.
    TokenStorage.remove();
    queryClient.clear();
    setIsProfileOpen(false);
    router.replace("/login");
  };

  const initials = (user?.name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Open navigation menu"
          aria-controls="app-sidebar"
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
        >
          <Menu className="size-[18px]" />
        </button>

        <span className="micro-label truncate">{sectionLabel}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {theme === "dark" ? (
            <Sun className="size-[18px]" />
          ) : (
            <Moon className="size-[18px]" />
          )}
        </button>

        <div className="mx-1.5 hidden h-5 w-px bg-border sm:block" />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
            className={cn(
              "flex items-center gap-2.5 rounded-md py-1.5 pr-2 pl-1.5 transition-colors hover:bg-muted",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isProfileOpen && "bg-muted",
            )}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-[3px] bg-foreground font-mono text-[10px] leading-none font-bold text-background">
              {initials || "—"}
            </span>
            <span className="hidden max-w-[9rem] flex-col items-start leading-tight sm:flex">
              <span className="w-full truncate text-[13px] font-medium text-foreground">
                {user?.name ?? "Loading…"}
              </span>
              {user?.role?.name && (
                <span className="text-[9px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  {user.role.name}
                </span>
              )}
            </span>
            <ChevronDown
              className={cn(
                "size-3.5 text-muted-foreground transition-transform duration-150",
                isProfileOpen && "rotate-180",
              )}
            />
          </button>

          {isProfileOpen && (
            <div
              role="menu"
              className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-lg border border-border bg-popover shadow-[0_16px_40px_-20px_rgba(9,9,11,0.3)]"
            >
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-[13px] font-medium text-foreground">
                  {user?.name ?? "—"}
                </p>
                <p className="truncate text-[12px] text-muted-foreground">
                  {user?.email ?? "—"}
                </p>
              </div>
              <div className="p-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
