"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { CompanyTable } from "@/components/company-table";
import { EditCompanyModal } from "@/components/edit-company-modal";
import { AddCompanyModal } from "@/components/add-company-model";
import { motion } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mutations } from "@/tanstack/Mutations/mutations";

export default function CompaniesPage() {
  const [editingCompany, setEditingCompany] = React.useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const companyMutation = useMutation(Mutations.updateCompany(queryClient));
  const newCompanyMutation = useMutation(Mutations.createCompany(queryClient));

  const handleSave = (updatedCompany: any) => {
    companyMutation.mutate({
      id: updatedCompany.id,
      data: {
        companyName: updatedCompany.name,
        dialerLink: updatedCompany.dialerLink,
        noOfServers: updatedCompany.servers,
        serverCharges: updatedCompany.charges,
        renewalDate: updatedCompany.renewalDate,
        comment: updatedCompany.comment,
        password: updatedCompany.password,
        status: updatedCompany.status.toLowerCase(),
        inactiveDate: updatedCompany.inactiveDate ?? "",
        additionalComment: updatedCompany.additionalComment,
      },
    });
    setEditingCompany(null);
  };

  const handleAdd = (newCompany: any) => {
    newCompanyMutation.mutate({
      companyName: newCompany.name,
      dialerLink: newCompany.dialerLink,
      password: newCompany.password,
      noOfServers: newCompany.servers,
      serverCharges: newCompany.charges,
      renewalDate: newCompany.renewalDate,
      joiningDate: newCompany.joiningDate,
      comment: newCompany.comment,
      status: newCompany.status.toLowerCase(),
      additionalComment: newCompany.additionalComment,
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <div className="flex-1 p-8 flex flex-col gap-8">
          <header>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold tracking-tight mb-2"
            >
              Companies
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-black/40 dark:text-white/40 font-medium"
            >
              Manage and monitor all registered companies.
            </motion.p>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CompanyTable
              onEditClick={(company) => setEditingCompany(company)}
              onAddClick={() => setIsAddModalOpen(true)}
            />
          </motion.div>
        </div>
      </main>

      <EditCompanyModal
        isOpen={!!editingCompany}
        onClose={() => setEditingCompany(null)}
        company={editingCompany}
        onSave={handleSave}
      />

      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}
