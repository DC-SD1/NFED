export const createAuthQueryOptions = (authUserId: string | null) => ({
  enabled: !!authUserId,
  retry: (failureCount: number, error: any) => {
    if (error && "status" in error && error.status === 401) return false;
    return failureCount < 3;
  },
});
