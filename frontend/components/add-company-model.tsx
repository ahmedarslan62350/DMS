"use client";

import * as React from "react";
import { Plus } from "lucide-react";

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

export interface NewCompanyValues {
  name: string;
  joiningDate: string;
  dialerLink: string;
  password: string;
  servers: number;
  charges: number;
  paidAmount: number;
  renewalDate: string;
  status: string;
  comment: string;
  additionalComment: string;
}

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newCompany: NewCompanyValues) => void;
}

const todayIso = () => new Date().toISOString().split("T")[0];

const emptyCompany = (): NewCompanyValues => ({
  name: "",
  joiningDate: todayIso(),
  dialerLink: "",
  password: "",
  servers: 1,
  charges: 0,
  paidAmount: 0,
  renewalDate: "",
  status: "Active",
  comment: "",
  additionalComment: "",
});

export function AddCompanyModal({
  isOpen,
  onClose,
  onAdd,
}: Readonly<AddCompanyModalProps>) {
  const [formData, setFormData] = React.useState<NewCompanyValues>(emptyCompany);

  // Start every new entry from a clean slate, including after a cancel.
  React.useEffect(() => {
    if (!isOpen) setFormData(emptyCompany());
  }, [isOpen]);

  const setField = <K extends keyof NewCompanyValues>(
    field: K,
    value: NewCompanyValues[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add company</DialogTitle>
          <DialogDescription>
            Register a new dialer account. It joins this month&apos;s billing as
            soon as it is created.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <DialogBody className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="add-name">Company name</Label>
              <Input
                id="add-name"
                required
                autoFocus
                placeholder="Company name"
                value={formData.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-dialerLink">Dialer link</Label>
              <Input
                id="add-dialerLink"
                type="url"
                required
                placeholder="https://dialer.example.com"
                value={formData.dialerLink}
                onChange={(e) => setField("dialerLink", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-password">Portal password</Label>
              <Input
                id="add-password"
                required
                placeholder="Account password"
                value={formData.password}
                onChange={(e) => setField("password", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-servers">Servers</Label>
              <Input
                id="add-servers"
                type="number"
                min="1"
                required
                className="tnum"
                value={formData.servers}
                onChange={(e) => setField("servers", Number(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-charges">Monthly charges</Label>
              <Input
                id="add-charges"
                type="number"
                min="0"
                step="0.01"
                required
                className="tnum"
                value={formData.charges}
                onChange={(e) => setField("charges", Number(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-paidAmount">Paid amount</Label>
              <Input
                id="add-paidAmount"
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
              <Label htmlFor="add-joiningDate">Joining date</Label>
              <Input
                id="add-joiningDate"
                type="date"
                required
                className="tnum"
                value={formData.joiningDate}
                onChange={(e) => setField("joiningDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-renewalDate">Renewal date</Label>
              <Input
                id="add-renewalDate"
                type="date"
                required
                className="tnum"
                value={formData.renewalDate}
                onChange={(e) => setField("renewalDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-status">Initial status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setField("status", value)}
              >
                <SelectTrigger id="add-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="add-comment">Renewal details</Label>
              <Input
                id="add-comment"
                placeholder="Anything to note about this renewal"
                value={formData.comment}
                onChange={(e) => setField("comment", e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="add-additionalComment">Additional comment</Label>
              <Input
                id="add-additionalComment"
                value={formData.additionalComment}
                onChange={(e) => setField("additionalComment", e.target.value)}
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="size-4" />
              Add company
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
