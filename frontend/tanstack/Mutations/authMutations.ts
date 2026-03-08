import { MutationFactory } from "./mutationFactory";
import { AuthApis } from "@/apis/auth.apis";
import { TokenStorage } from "@/lib/helpers";
import { QueryClient } from "@tanstack/react-query";

export class AuthMutations {
  static login(queryClient: QueryClient) {
    return MutationFactory.createMutation({
      queryClient,
      mutationFn: AuthApis.login,

      invalidateKeys: [["auth"]],

      onSuccess: (data: any) => {
        if (data?.token) {
          TokenStorage.set(data.token);
        }
      },
    });
  }

  static register(queryClient: QueryClient) {
    return MutationFactory.createMutation({
      queryClient,
      mutationFn: AuthApis.register,
    });
  }

  static logout(queryClient: QueryClient) {
    return {
      mutationFn: async () => {
        TokenStorage.remove();
      },

      onSuccess: () => {
        queryClient.clear();
      },
    };
  }
}
