"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Plus,
  Building2,
  Link as LinkIcon,
  Server,
  DollarSign,
  Calendar,
  Activity,
  File,
  Lock,
} from "lucide-react";

interface Company {
  name: string;
  joiningDate: string;
  dialerLink: string;
  password: string;
  servers: number;
  charges: number;
  renewalDate: string;
  status: string;
  comment: string;
  additionalComment: string;
}

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newCompany: Company) => void;
}

export function AddCompanyModal({
  isOpen,
  onClose,
  onAdd,
}: Readonly<AddCompanyModalProps>) {
  const [formData, setFormData] = React.useState<Company>({
    name: "",
    joiningDate: new Date().toISOString().split("T")[0],
    dialerLink: "",
    password: "",
    servers: 1,
    charges: 0,
    renewalDate: "",
    status: "Active",
    comment: "",
    additionalComment: "",
  });

  const handleChange = (field: keyof Company, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
    setFormData({
      name: "",
      joiningDate: new Date().toISOString().split("T")[0],
      dialerLink: "",
      password: "",
      servers: 1,
      charges: 0,
      renewalDate: "",
      status: "Active",
      comment: "",
      additionalComment: "",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed scale-[0.6] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl z-[60] overflow-hidden"
          >
            <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Add New Company
                </h2>
                <p className="text-sm text-black/40 dark:text-white/40">
                  Register a new client company into the system.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 flex items-center gap-2">
                    <Building2 className="w-3 h-3" /> Company Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. TechFlow Solutions"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" /> Dialer Link
                  </label>
                  <input
                    required
                    type="url"
                    placeholder="https://dialer.example.com"
                    value={formData.dialerLink}
                    onChange={(e) => handleChange("dialerLink", e.target.value)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 flex items-center gap-2">
                    <Lock className="w-3 h-3" /> Password
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="123456789"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 flex items-center gap-2">
                    <Server className="w-3 h-3" /> Total Servers
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.servers}
                    onChange={(e) =>
                      handleChange("servers", Number.parseInt(e.target.value))
                    }
                    className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Monthly Charges
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. $1,200"
                    value={formData.charges}
                    onChange={(e) =>
                      handleChange("charges", Number.parseInt(e.target.value))
                    }
                    className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Renewal Date
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.renewalDate}
                    onChange={(e) =>
                      handleChange("renewalDate", e.target.value)
                    }
                    className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Joining Date
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) =>
                      handleChange("joiningDate", e.target.value)
                    }
                    className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 flex items-center gap-2">
                  <File className="w-3 h-3" /> Renewal Details
                </label>
                <input
                  type="text"
                  value={formData.comment}
                  onChange={(e) => handleChange("comment", e.target.value)}
                  className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 flex items-center gap-2">
                  <File className="w-3 h-3" /> Additional Comment
                </label>
                <input
                  type="text"
                  value={formData.additionalComment}
                  onChange={(e) =>
                    handleChange("additionalComment", e.target.value)
                  }
                  className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Company
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
