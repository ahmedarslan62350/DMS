"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import {
  CompanyTable,
  AUDIT_FIELD_LABELS,
} from "@/components/company-table";
import { EditCompanyModal } from "@/components/edit-company-modal";
import { AddCompanyModal } from "@/components/add-company-model";
import { FieldLogsModal } from "@/components/field-logs-modal";
import { PageHeader } from "@/components/shared/page-header";
import { motion } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mutations } from "@/tanstack/Mutations/mutations";
import { useFieldLogs } from "@/hooks/useQueries";

export default function CompaniesPage() {
  const [editingCompany, setEditingCompany] = React.useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [fieldLogTarget, setFieldLogTarget] = React.useState<{
    companyId: string;
    field: string;
  } | null>(null);
  const [fieldLogPage, setFieldLogPage] = React.useState(1);

  const queryClient = useQueryClient();
  const companyMutation = useMutation(Mutations.updateCompany(queryClient));
  const newCompanyMutation = useMutation(Mutations.createCompany(queryClient));

  const {
    logs: fieldLogs,
    total: fieldLogsTotal,
    page: fieldLogsPage,
    pages: fieldLogsPages,
    isLoading: fieldLogsLoading,
    isError: fieldLogsError,
    refetch: refetchFieldLogs,
  } = useFieldLogs(
    "Company",
    fieldLogTarget?.companyId ?? "",
    fieldLogTarget?.field ?? "",
    fieldLogPage,
    !!fieldLogTarget,
  );

  const handleFieldClick = (companyId: string, fieldName: string) => {
    setFieldLogTarget({ companyId, field: fieldName });
    setFieldLogPage(1);
  };

  const handleCloseFieldLogs = () => {
    setFieldLogTarget(null);
    setFieldLogPage(1);
  };

  const handleSave = (updatedCompany: any) => {
    console.log(updatedCompany);

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

  const handlePaidAmountChange = async (
    companyId: string,
    newAmount: number,
  ): Promise<void> => {
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
            await queryClient.refetchQueries({ queryKey: ["companies"] });
            resolve();
          },
          onError: (error) => reject(error),
        },
      );
    });
  };

  const fieldLabel = fieldLogTarget
    ? (AUDIT_FIELD_LABELS[fieldLogTarget.field] ?? fieldLogTarget.field)
    : "";

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <div className="flex flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8">
          <PageHeader
            title="Companies"
            description="Manage and monitor all registered companies. Click any field cell to view its change history."
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
              onFieldClick={handleFieldClick}
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

      <FieldLogsModal
        isOpen={!!fieldLogTarget}
        onClose={handleCloseFieldLogs}
        fieldName={fieldLabel}
        logs={fieldLogs}
        total={fieldLogsTotal}
        page={fieldLogsPage}
        pages={fieldLogsPages}
        onPageChange={setFieldLogPage}
        isLoading={fieldLogsLoading}
        isError={fieldLogsError}
        onRetry={refetchFieldLogs}
      />
    </div>
  );
}
