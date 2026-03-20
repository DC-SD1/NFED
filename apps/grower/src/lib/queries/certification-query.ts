import { useApiClient } from "../api";
import { useAuthUser } from "../stores/auth-store-ssr";

export function useGetCertifications(options?: { enabled?: boolean }) {
  const { userId: authUserId } = useAuthUser();
  const api = useApiClient();
  const enabled = options?.enabled ?? true;

  const {
    data: certificationsData,
    error,
    isPending: isLoading,
    isError,
    refetch,
  } = api.useQuery("get", "/kyc/certifications", {
    enabled: enabled && !!authUserId,
    retry: false,
  });

  return {
    certificationsData,
    isLoading,
    isError,
    error,
    refetch,
  };
}
