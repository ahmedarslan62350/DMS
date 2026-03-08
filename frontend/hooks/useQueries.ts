"use client";

import { Queries } from "@/tanstack/Queries/queries";
import { useQuery } from "@tanstack/react-query";

export const useCompanies = (page?: number, limit?: number) => {
  const { data, isLoading, isError } = useQuery(Queries.companies());
  const companies = data || [];

  return {
    companies,
    isLoading,
    isError,
    count: companies.length,
  };
};

export const useLogs = (page = 1, limit = 10) => {
  const { data, isLoading, isError, refetch } = useQuery(
    Queries.auditLogs(page, limit),
  );

  return {
    logs: data?.data || [],
    isLoading,
    isError,
    refetch,
    total: data?.total || 0,
  };
};

export const useUsers = () => {
  const { data, isLoading, isError, refetch } = useQuery(
    Queries.users(),
  );

  return {
    users: data || [],
    isLoading,
    isError,
    refetch,
  };
};

export const useRoles = () => {
  const { data, isLoading, isError, refetch } = useQuery(
    Queries.roles(),
  );

  return {
    roles: data || [],
    isLoading,
    isError,
    refetch,
  };
};

