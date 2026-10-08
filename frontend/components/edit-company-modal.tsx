"use client";

import * as React from "react";
import { Save, Trash2 } from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useMe } from "@/hooks/useMe";

export interface CompanyFormValues {
  id: number | string;
  name: string;
  joiningDate: string;
  dialerLink: string;
  password: string;
  servers: number;
  charges: number;
  paidAmount: number;
  renewalDate: string;
  inactiveDate?: string;
  status: string;
  comment: string;
  additionalComment: string;
}

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyFormValues | null;
  onSave: (updatedCompany: CompanyFormValues) => void;
  onDelete?: (company: CompanyFormValues) => void;
}

export function EditCompanyModal({
  isOpen,
  onClose,
  company,
  onSave,
  onDelete,
}: Readonly<EditCompanyModalProps>) {
  const [formData, setFormData] = React.useState<CompanyFormValues | null>(null);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const { user } = useMe();

  /*
   * Only an admin may change the joining date — the API enforces this with a
   * 403. Reflecting that here stops non-admins from triggering a failed save.
   */
  const canEditJoiningDate = user?.role?.name === "admin";

  React.useEffect(() => {
    if (company) {
      setFormData({ ...company });
      setConfirmingDelete(false);
    }
  }, [company]);

  /*
   * Status used to live in its own state initialised from a null `formData`,
   * so an inactive company always rendered as active and the inactive-date
   * field never appeared. Deriving it from the form fixes that.
   */
  const status = (formData?.status ?? "Active").toLowerCase();
  const isInactive = status === "inactive";

  if (!formData) return null;

  const setField = <K extends keyof CompanyFormValues>(
    field: K,
    value: CompanyFormValues[K],
  ) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData) return;
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit company</DialogTitle>
          <DialogDescription>
            {company?.name}
            {company?.id !== undefined && (
              <span className="mono-id"> · ID {String(company.id)}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <DialogBody className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-name">Company name</Label>
              <Input
                id="edit-name"
                required
                value={formData.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dialerLink">Dialer link</Label>
              <Input
                id="edit-dialerLink"
                type="url"
                placeholder="https://dialer.example.com"
                value={formData.dialerLink ?? ""}
                onChange={(e) => setField("dialerLink", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">Password</Label>
              <Input
                id="edit-password"
                required
                value={formData.password ?? ""}
                onChange={(e) => setField("password", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-servers">Servers</Label>
              <Input
                id="edit-servers"
                type="number"
                min="0"
                className="tnum"
                value={formData.servers}
                onChange={(e) => setField("servers", Number(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-charges">Monthly charges</Label>
              <Input
                id="edit-charges"
                type="number"
                min="0"
                step="0.01"
                className="tnum"
                value={formData.charges}
                onChange={(e) => setField("charges", Number(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-paidAmount">Paid amount</Label>
              <Input
                id="edit-paidAmount"
                type="number"
                min="0"
                step="0.01"
                className="tnum"
                value={formData.paidAmount}
                onChange={(e) =>
                  setField("paidAmount", Number(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-renewalDate">Renewal date</Label>
              <Input
                id="edit-renewalDate"
                type="date"
                required
                className="tnum"
                value={formData.renewalDate ?? ""}
                onChange={(e) => setField("renewalDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-joiningDate">
                Joining date
                {!canEditJoiningDate && (
                  <span className="ml-1 normal-case opacity-70">
                    (admin only)
                  </span>
                )}
              </Label>
              <Input
                id="edit-joiningDate"
                type="date"
                className="tnum"
                disabled={!canEditJoiningDate}
                value={formData.joiningDate ?? ""}
                onChange={(e) => setField("joiningDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setField("status", value)}
              >
                <SelectTrigger id="edit-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isInactive && (
              <div className="space-y-2">
                <Label htmlFor="edit-inactiveDate">Inactive date</Label>
                <Input
                  id="edit-inactiveDate"
                  type="date"
                  className="tnum"
                  value={formData.inactiveDate ?? ""}
                  onChange={(e) => setField("inactiveDate", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-comment">Renewal details</Label>
              <Input
                id="edit-comment"
                value={formData.comment ?? ""}
                onChange={(e) => setField("comment", e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-additionalComment">Additional comment</Label>
              <Input
                id="edit-additionalComment"
                value={formData.additionalComment ?? ""}
                onChange={(e) => setField("additionalComment", e.target.value)}
              />
            </div>
          </DialogBody>

          <DialogFooter className="sm:justify-between">
            {onDelete ? (
              confirmingDelete ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="solidDestructive"
                    size="sm"
                    onClick={() => {
                      onDelete(formData);
                      onClose();
                    }}
                  >
                    Confirm delete
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Keep
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmingDelete(true)}
                >
                  <Trash2 className="size-3.5" />
                  Delete company
                </Button>
              )
            ) : (
              <span />
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="size-4" />
                Save changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
