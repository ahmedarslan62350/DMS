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
} from "lucide-react";
import { useTheme } from "./theme-provider";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import { Button } from "./ui/button";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const router = useRouter();
  const me = useMe();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <header className="h-20 border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder="Search companies, logs, or alerts..."
            className="w-full bg-black/5 dark:bg-white/5 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/5 dark:border-white/10"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <button className="p-2.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/5 dark:border-white/10 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black" />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/5 dark:border-white/10"
          >
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <User className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span className="text-sm font-medium">{me.user?.name}</span>
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
