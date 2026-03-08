'use client';

import * as React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { motion } from 'motion/react';
import { 
  Globe, 
  Shield, 
  Mail, 
  Bell, 
  Database, 
  Zap,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SystemSettingsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
          <header className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">System Settings</h1>
              <p className="text-black/40 dark:text-white/40 font-medium">
                Global configuration and system-wide preferences.
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Save className="w-5 h-5" /> Save Changes
            </button>
          </header>

          <div className="space-y-8">
            {/* General Settings */}
            <section className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Globe className="w-5 h-5 text-black/40 dark:text-white/40" />
                <h2 className="text-lg font-bold">General Configuration</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Portal Name</label>
                  <input type="text" defaultValue="DialerFlow Portal" className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Support Email</label>
                  <input type="email" defaultValue="support@dialerflow.com" className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all" />
                </div>
              </div>
            </section>

            {/* Security Settings */}
            <section className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Shield className="w-5 h-5 text-black/40 dark:text-white/40" />
                <h2 className="text-lg font-bold">Security & Access</h2>
              </div>
              <div className="space-y-6">
                {[
                  { label: 'Two-Factor Authentication', desc: 'Require 2FA for all administrative accounts', enabled: true },
                  { label: 'Session Timeout', desc: 'Automatically log out inactive users after 30 minutes', enabled: true },
                  { label: 'IP Whitelisting', desc: 'Restrict admin access to specific IP ranges', enabled: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs text-black/40 dark:text-white/40">{item.desc}</p>
                    </div>
                    <button className={cn(
                      "w-12 h-6 rounded-full transition-all relative inline-flex items-center px-1",
                      item.enabled ? "bg-black dark:bg-white" : "bg-black/10 dark:bg-white/10"
                    )}>
                      <motion.div
                        animate={{ x: item.enabled ? 24 : 0 }}
                        className={cn(
                          "w-4 h-4 rounded-full shadow-sm",
                          item.enabled ? "bg-white dark:bg-black" : "bg-white"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Infrastructure */}
            <section className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Database className="w-5 h-5 text-black/40 dark:text-white/40" />
                <h2 className="text-lg font-bold">Infrastructure</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold uppercase tracking-wider">Primary Database</span>
                  </div>
                  <p className="text-xs text-black/40 dark:text-white/40">Status: Connected</p>
                  <p className="text-xs text-black/40 dark:text-white/40">Region: us-east-1</p>
                </div>
                <div className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-bold uppercase tracking-wider">Notification Service</span>
                  </div>
                  <p className="text-xs text-black/40 dark:text-white/40">Status: Active</p>
                  <p className="text-xs text-black/40 dark:text-white/40">Provider: Amazon SES</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
