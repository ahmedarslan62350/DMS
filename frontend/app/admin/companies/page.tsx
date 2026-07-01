'use client';

import * as React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { CompanyTable } from '@/components/company-table';
import { AdminEditCompanyModal } from '@/components/admin-edit-company-modal';
import { AddCompanyModal } from '@/components/add-company-model';
import { PageHeader } from '@/components/shared/page-header';
import { motion } from 'motion/react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mutations } from "@/tanstack/Mutations/mutations";

export default function CompaniesPage() {
  const [editingCompany, setEditingCompany] = React.useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const companyMutation = useMutation(Mutations.updateCompany(queryClient));
  const newCompanyMutation = useMutation(Mutations.createCompany(queryClient));

  const handleSave = (updatedCompany: any) => {
    console.log('Saving company:', updatedCompany);

    companyMutation.mutate({
      id: updatedCompany.id,
      data: {
        companyName: updatedCompany.name,
        dialerLink: updatedCompany.dialerLink,
        noOfServers: updatedCompany.servers,
        serverCharges: updatedCompany.charges,
        paidAmount: updatedCompany.paidAmount,
        renewalDate: updatedCompany.renewalDate,
        joiningDate: updatedCompany.joiningDate,
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
      paidAmount: newCompany.paidAmount || 0,
      renewalDate: newCompany.renewalDate,
      joiningDate: newCompany.joiningDate,
      comment: newCompany.comment,
      status: newCompany.status.toLowerCase(),
      additionalComment: newCompany.additionalComment,
    });
    setIsAddModalOpen(false);
  };

  const handlePaidAmountChange = async (companyId: string, newAmount: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      companyMutation.mutate(
        {
          id: companyId,
          data: {
            paidAmount: newAmount,
          },
        },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["companies"] });
            // Wait for the refetch to complete
            await queryClient.refetchQueries({ queryKey: ["companies"] });
            resolve();
          },
          onError: (error) => reject(error),
        }
      );
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <div className="flex flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8">
          <PageHeader
            title="Companies"
            description="Manage and monitor all registered companies."
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CompanyTable
              onEditClick={(company) => setEditingCompany(company)}
              onAddClick={() => setIsAddModalOpen(true)}
              onPaidAmountChange={handlePaidAmountChange}
            />
          </motion.div>
        </div>
      </main>

      <AdminEditCompanyModal
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
