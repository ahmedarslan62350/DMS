"use client";

import { Queries } from "@/tanstack/Queries/queries";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useMe = () => {
  const router = useRouter();
  const { data, isError, isFetched, isLoading } = useQuery(
    Queries.currentUser()
  );

  const user = data?.user;
  const shouldRedirect = isFetched && (isError || !user);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/login");
    }
  }, [shouldRedirect, router]);

  return { 
    user: shouldRedirect ? null : user, 
    isLoading: isLoading || (shouldRedirect) 
  };
};
