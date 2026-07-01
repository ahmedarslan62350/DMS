"use client";

import * as React from "react";
import {
  Search,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  UserCircle,
  Bell,
  Menu,
} from "lucide-react";
import { useTheme } from "./theme-provider";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import { Button } from "./ui/button";
import { toggleMobileSidebar } from "@/hooks/useSidebar";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const router = useRouter();
  const me = useMe();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-black/5 bg-white/80 px-4 backdrop-blur-md sm:h-20 sm:px-6 lg:px-8 dark:border-white/10 dark:bg-black/80">
      <button
        onClick={toggleMobileSidebar}
        aria-label="Toggle navigation menu"
        aria-controls="app-sidebar"
        className="rounded-xl p-2 text-black/60 transition-colors hover:bg-black/5 hover:text-black lg:hidden dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden max-w-xl flex-1 md:block">
        <div className="group relative">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-black/40 transition-colors group-focus-within:text-black dark:text-white/40 dark:group-focus-within:text-white" />
          <input
            type="text"
            placeholder="Search companies, logs, or alerts..."
            className="w-full rounded-2xl border-none bg-black/5 py-2.5 pr-4 pl-11 text-sm transition-all outline-none focus:ring-2 focus:ring-black dark:bg-white/5 dark:focus:ring-white"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="rounded-2xl border border-black/5 p-2.5 transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <button
          aria-label="Notifications"
          className="relative hidden rounded-2xl border border-black/5 p-2.5 transition-colors hover:bg-black/5 sm:block dark:border-white/10 dark:hover:bg-white/5"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black" />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
            className="flex items-center gap-2 rounded-full border border-black/5 p-1 pr-1 transition-colors hover:bg-black/5 sm:pr-3 dark:border-white/10 dark:hover:bg-white/5"
          >
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <User className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span className="hidden text-sm font-medium sm:inline">{me.user?.name}</span>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden"
              >
                <div className="p-2 space-y-1">
                  {/* <button className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <UserCircle className="w-4 h-4" /> Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </button> */}
                  <div className="h-px bg-black/5 dark:bg-white/10 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
