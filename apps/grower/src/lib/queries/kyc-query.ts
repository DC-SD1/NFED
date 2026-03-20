import { useApiClient } from "../api";
import { useAuthUser } from "../stores/auth-store-ssr";

export function useGetKyc(options?: { enabled?: boolean }) {
  const { userId: authUserId } = useAuthUser();
  const api = useApiClient();
  const enabled = options?.enabled ?? true;

  const {
    data: kycData,
    error,
    isPending: isLoading,
    isError,
    refetch,
  } = api.useQuery(
    "get",
    "/kyc/get-kyc",
    {
      params: {
        query: {
          UserId: authUserId ?? "",
        },
      },
    },
    {
      enabled: enabled && !!authUserId,
      retry: false,
    },
  );

  return {
    kycData,
    isLoading,
    isError,
    error,
    refetch,
  };
}
