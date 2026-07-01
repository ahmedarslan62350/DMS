"use client";

import { Queries } from "@/tanstack/Queries/queries";
import { useQuery } from "@tanstack/react-query";

export const useCompanies = (page?: number, limit?: number) => {
  const { data, isLoading, isError, refetch } = useQuery(Queries.companies());
  const companies = data || [];

  return {
    companies,
    isLoading,
    isError,
    refetch,
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

export const useEntityLogs = (
  entityType: string,
  entityId: string,
  idx = 0,
) => {
  const { data, isLoading, isError, refetch } = useQuery(
    Queries.entityAuditLogs(entityType, entityId, idx),
  );

  return {
    logs: data || [],
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

export const useMonthlyCharges = () => {
  const { data, isLoading, isError, refetch } = useQuery(
    Queries.currentMonthCharges(),
  );

  return {
    monthlyCharges: data || null,
    isLoading,
    isError,
    refetch,
  };
};

export const useFieldLogs = (
  entityType: string,
  entityId: string,
  field: string,
  page = 1,
  enabled = true,
) => {
  const { data, isLoading, isError, refetch } = useQuery(
    Queries.fieldLogs(entityType, entityId, field, page, enabled),
  );

  return {
    logs: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pages: data?.pages || 1,
    isLoading,
    isError,
    refetch,
  };
};
