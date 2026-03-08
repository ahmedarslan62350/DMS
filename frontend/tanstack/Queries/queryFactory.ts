import { QueryKey, QueryFunctionContext } from "@tanstack/react-query";

export class QueryFactory {
  static createQuery<TData>(
    queryKey: QueryKey,
    queryFn: (context: QueryFunctionContext) => Promise<TData>,
  ) {
    return {
      queryKey,
      queryFn,
    };
  }

  static createQueryWithParams<TData, TParams>(
    baseKey: string,
    params: TParams,
    queryFn: (params: TParams) => Promise<TData>,
  ) {
    return {
      queryKey: [baseKey, params],
      queryFn: () => queryFn(params),
    };
  }
}