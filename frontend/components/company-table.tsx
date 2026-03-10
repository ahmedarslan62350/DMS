"use client";

import * as React from "react";
import { Edit2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/hooks/useQueries";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";

interface CompanyTableProps {
  onEditClick: (company: any) => void;
  onAddClick: () => void;
}

export function CompanyTable({
  onEditClick,
  onAddClick,
}: Readonly<CompanyTableProps>) {
  const [status, setStatus] = React.useState<"Active" | "Inactive" | "All">(
    "Active",
  );
  const [search, setSearch] = React.useState("");
  const today = new Date();

  const { companies: companiesData } = useCompanies() || { data: [] };

  const allCompanies = React.useMemo(() => {
    return (companiesData || []).map((c: any) => ({
      id: c._id,
      name: c.companyName,
      joiningDate: new Date(c.joiningDate).toISOString().split("T")[0],
      dialerLink: c.dialerLink,
      servers: c.noOfServers || 0,
      charges: c.serverCharges,
      password: c.password,
      renewalDate: new Date(c.renewalDate).toISOString().split("T")[0],
      status: c.status.charAt(0).toUpperCase() + c.status.slice(1),
      comment: c.comment,
      additionalComment: c?.additionalComment || "None",
    }));
  }, [companiesData]);

  const filteredCompanies = React.useMemo(() => {
    if (status === "All") return allCompanies;
    return allCompanies.filter(
      (c: any) =>
        c.status === status &&
        c.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [status, allCompanies, search]);

  const companies = React.useMemo(() => {
    const companies = filteredCompanies
      .map((c: any) => {
        const renewalDate = new Date(c.renewalDate);

        const diffTime = renewalDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        
        let status = "Upcoming";
        if (diffDays <= 3 && diffDays > 0) status = "Urgent";
        else if (diffDays <= 5 && diffDays > 0) status = "Pending";
        else if (diffDays <= 0) status = "Passed";

        console.log(diffDays, status);
        c.renewalStatus = status;
        c.days = diffDays;

        return c;
      })
      .sort((a: any, b: any) => a.days - b.days);

    return companies;
  }, [filteredCompanies, today]);

  return (
    <div className="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Companies Overview</h2>

        <div className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/2"
            placeholder="Search..."
          ></Input>
          <Select
            value={status}
            onValueChange={(value: "Active" | "Inactive" | "All") =>
              setStatus(value)
            }
          >
            <SelectTrigger className="w-1/4 max-w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            onClick={onAddClick}
            className="text-sm font-medium px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
          >
            Add Company
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full w-max text-left table-fixed border-collapse">
          <thead>
            <tr className="bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
              <th className="px-6 min-w-[150px] py-4">Company Name</th>
              <th className="px-6 min-w-[150px] py-4">Renewal Date</th>
              <th className="px-6 min-w-[150px] py-4">Dialer Link</th>
              <th className="px-6 min-w-[150px] py-4">Password</th>
              <th className="px-6 min-w-[150px] py-4">Servers</th>
              <th className="px-6 min-w-[150px] py-4">Charges</th>
              <th className="px-6 min-w-[150px] py-4">Status</th>
              <th className="px-6 py-4 w-80">Renewal Details</th>
              <th className="px-6 py-4 w-80">Additional Comment</th>
              <th className="px-6 py-4">Joining Date</th>
              <th className="px-6 min-w-[150px] py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {companies.map((company: any) => (
              <tr
                key={company.id}
                className={`group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors ${company.renewalStatus === "Passed" && "bg-red-300/50 hover:bg-red-400/50"} ${company.renewalStatus === "Urgent" && "bg-blue-400/30 hover:bg-blue-500/50"} ${company.renewalStatus === "Pending" && "bg-green-400/30 hover:bg-green-500/50"}`}
              >
                <td className="px-6 py-4">
                  <span className="font-bold text-sm">{company.name}</span>
                </td>
                <td className="px-6 py-4 text-sm text-black/60 dark:text-white/60">
                  {company.renewalDate}
                </td>
                <td className="px-6 py-4">
                  <a
                    href={company.dialerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {company.dialerLink} <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-mono">{company.password}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-mono">{company.servers}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold">${company.charges}</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      company.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-red-500/10 text-red-500",
                    )}
                  >
                    {company.status}
                  </span>
                </td>
                <td className="px-6 py-4 w-80">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    )}
                  >
                    {company.comment}
                  </span>
                </td>
                <td className="px-6 py-4 w-80">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    )}
                  >
                    {company?.additionalComment}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-black/60 dark:text-white/60">
                  {company.joiningDate}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEditClick(company)}
                      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {/* <button className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">
                      <History className="w-4 h-4" />
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
