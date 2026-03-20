"use client";

import { useUser } from "@/lib/context";
import { ROLES } from "@/lib/schemas/auth";

interface RoleBasedContentProps {
  farmerContent?: React.ReactNode;
  agentContent?: React.ReactNode;
  defaultContent?: React.ReactNode;
  children?: React.ReactNode;
}

export function RoleBasedContent({
  farmerContent,
  agentContent,
  defaultContent,
  children,
}: RoleBasedContentProps) {
  const { isPrimaryRole, isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return defaultContent || children || null;
  }

  if (isPrimaryRole(ROLES.BUYER) && farmerContent) {
    return <>{farmerContent}</>;
  }

  if (isPrimaryRole("Agent") && agentContent) {
    return <>{agentContent}</>;
  }

  return defaultContent || children || null;
}
