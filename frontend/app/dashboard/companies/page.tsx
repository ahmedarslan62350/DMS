"use client";

import * as React from "react";
import { AppShell } from "@/components/app-shell";
import {
  CompanyTable,
  AUDIT_FIELD_LABELS,
} from "@/components/company-table";
import { EditCompanyModal } from "@/components/edit-company-modal";
import { AddCompanyModal } from "@/components/add-company-model";
import { FieldLogsModal } from "@/components/field-logs-modal";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mutations } from "@/tanstack/Mutations/mutations";
import { useFieldLogs } from "@/hooks/useQueries";
import { getApiErrorMessage } from "@/lib/axios";

type Notice = { tone: "error" | "success"; message: string } | null;

export default function CompaniesPage() {
  const [editingCompany, setEditingCompany] = React.useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [fieldLogTarget, setFieldLogTarget] = React.useState<{
    companyId: string;
    field: string;
  } | null>(null);
  const [fieldLogPage, setFieldLogPage] = React.useState(1);
  const [notice, setNotice] = React.useState<Notice>(null);

  const queryClient = useQueryClient();
  const companyMutation = useMutation(Mutations.updateCompany(queryClient));
  const newCompanyMutation = useMutation(Mutations.createCompany(queryClient));
  const deleteCompanyMutation = useMutation(
    Mutations.deleteCompany(queryClient),
  );

  // Auto-dismiss transient feedback.
  React.useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

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

  const handleSave = (updatedCompany: any) => {
    companyMutation.mutate(
      {
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
          status: String(updatedCompany.status).toLowerCase(),
          inactiveDate: updatedCompany.inactiveDate ?? "",
          additionalComment: updatedCompany.additionalComment,
        },
      },
      {
        onSuccess: () =>
          setNotice({ tone: "success", message: "Company updated." }),
        onError: (error) =>
          setNotice({ tone: "error", message: getApiErrorMessage(error) }),
      },
    );
    setEditingCompany(null);
  };

  const handleAdd = (newCompany: any) => {
    newCompanyMutation.mutate(
      {
        companyName: newCompany.name,
        dialerLink: newCompany.dialerLink,
        password: newCompany.password,
        noOfServers: newCompany.servers,
        serverCharges: newCompany.charges,
        paidAmount: newCompany.paidAmount || 0,
        renewalDate: newCompany.renewalDate,
        joiningDate: newCompany.joiningDate,
        comment: newCompany.comment,
        status: String(newCompany.status).toLowerCase(),
        additionalComment: newCompany.additionalComment,
      },
      {
        onSuccess: () =>
          setNotice({ tone: "success", message: "Company added." }),
        onError: (error) =>
          setNotice({ tone: "error", message: getApiErrorMessage(error) }),
      },
    );
    setIsAddModalOpen(false);
  };

  const handleDelete = (company: any) => {
    deleteCompanyMutation.mutate(company.id, {
      onSuccess: () =>
        setNotice({ tone: "success", message: `${company.name} deleted.` }),
      onError: (error) =>
        setNotice({ tone: "error", message: getApiErrorMessage(error) }),
    });
    setEditingCompany(null);
  };

  const handlePaidAmountChange = async (
    companyId: string,
    newAmount: number,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      companyMutation.mutate(
        { id: companyId, data: { paidAmount: newAmount } },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["companies"] });
            await queryClient.refetchQueries({ queryKey: ["companies"] });
            resolve();
          },
          onError: (error) => {
            setNotice({ tone: "error", message: getApiErrorMessage(error) });
            reject(error);
          },
        },
      );
    });
  };

  const fieldLabel = fieldLogTarget
    ? (AUDIT_FIELD_LABELS[fieldLogTarget.field] ?? fieldLogTarget.field)
    : "";

  return (
    <AppShell
      bleed
      title="Companies"
      description="Every dialer account, its servers, charges and renewal date. Select any cell to read that field's change history."
      actions={
        <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="size-4" />
          Add company
        </Button>
      }
    >
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={
            notice.tone === "error"
              ? "mb-4 flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/8 px-3.5 py-3"
              : "mb-4 flex items-start gap-2.5 rounded-md border border-success/30 bg-success/8 px-3.5 py-3"
          }
        >
          {notice.tone === "error" ? (
            <AlertCircle className="mt-px size-4 shrink-0 text-destructive" />
          ) : (
            <Check className="mt-px size-4 shrink-0 text-success" />
          )}
          <p
            className={
              notice.tone === "error"
                ? "body-sm text-destructive"
                : "body-sm text-success"
            }
          >
            {notice.message}
          </p>
        </div>
      )}

      <CompanyTable
        onEditClick={(company) => setEditingCompany(company)}
        onAddClick={() => setIsAddModalOpen(true)}
        onPaidAmountChange={handlePaidAmountChange}
        onFieldClick={handleFieldClick}
      />

      <EditCompanyModal
        isOpen={!!editingCompany}
        onClose={() => setEditingCompany(null)}
        company={editingCompany}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
      />

      <FieldLogsModal
        isOpen={!!fieldLogTarget}
        onClose={() => {
          setFieldLogTarget(null);
          setFieldLogPage(1);
        }}
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
    </AppShell>
  );
}
