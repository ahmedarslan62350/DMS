"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthMutations } from "@/tanstack/Mutations/authMutations";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter();

  const queryClient = useQueryClient();
  const loginMutation = useMutation(AuthMutations.login(queryClient));

  const onSubmit = () => {
    loginMutation.mutate({
      email,
      password,
    });

    if (loginMutation?.data?.user) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      {/* Top Right Controls */}
      <div className="absolute top-8 right-8 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-black/5 dark:border-white/10"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Left Branding Panel (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center overflow-hidden">
        {/* Subtle Gradient Texture & Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)]" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px] animate-pulse delay-700" />

        <div className="relative z-10 p-12 max-w-xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 flex justify-center"
          >
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              <Zap className="w-12 h-12 text-black" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl font-bold text-white tracking-tight mb-6"
          >
            Manage Dialer Companies Efficiently
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/40 text-lg leading-relaxed font-medium"
          >
            The all-in-one enterprise platform for dialer management, real-time
            monitoring, and automated renewal workflows.
          </motion.p>

          {/* Abstract Animated Shape */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mt-16 flex justify-center"
          >
            <div className="w-32 h-32 border border-white/10 rounded-full flex items-center justify-center">
              <div className="w-24 h-24 border border-white/20 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-white/5 rounded-full backdrop-blur-sm" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-[40px] p-10 shadow-2xl shadow-black/5 dark:shadow-white/5">
            <div className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Welcome back
              </h2>
              <p className="text-black/40 dark:text-white/40 font-medium">
                Please enter your details to sign in.
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 ml-1"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 dark:text-white/20 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label
                    htmlFor="password"
                    className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40"
                  >
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-xs font-bold text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 dark:text-white/20 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border-2 border-black/10 dark:border-white/10 rounded-lg checked:bg-black dark:checked:bg-white transition-all cursor-pointer"
                  />
                  <Zap className="absolute w-3 h-3 text-white dark:text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-sm font-medium text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white transition-colors">
                  Remember me for 30 days
                </span>
              </label>

              {/* Login Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSubmit}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all shadow-xl shadow-black/10 dark:shadow-white/10 mt-4"
              >
                Sign in to Portal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-black/40 dark:text-white/40 font-medium">
                Don&apos;t have an account?{" "}
                <Link
                  href="#"
                  className="text-black dark:text-white font-bold hover:underline underline-offset-4"
                >
                  Contact Admin
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
