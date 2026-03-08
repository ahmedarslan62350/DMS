import { QueryClient } from "@tanstack/react-query";

export class MutationFactory {
  static createMutation<TData, TVariables>(options: {
    mutationFn: (variables: TVariables) => Promise<TData>;
    invalidateKeys?: any[];
    queryClient: QueryClient;
    onSuccess?: (data?: any) => any;
  }) {
    const { mutationFn, invalidateKeys = [], queryClient } = options;

    return {
      mutationFn,
      onSuccess: (data: any) => {
        if (options.onSuccess) {
          options.onSuccess(data.token);
        }
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      },
    };
  }
}
