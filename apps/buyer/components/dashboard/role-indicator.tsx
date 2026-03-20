"use client";

import { Badge } from "@cf/ui/components/badge";

import { useUser } from "@/lib/context";
import { ROLES } from "@/lib/schemas/auth";

export function RoleIndicator() {
  const { roles, isPrimaryRole, isAuthenticated } = useUser();

  if (!isAuthenticated || !roles || roles.length === 0) {
    return null;
  }

  const primaryRole = roles[0];

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={
          isPrimaryRole(ROLES.BUYER)
            ? "default"
            : isPrimaryRole(ROLES.BUYER)
              ? "secondary"
              : "outline"
        }
        className="text-xs"
      >
        {primaryRole}
      </Badge>
      {roles.length > 1 && (
        <span className="text-muted-foreground text-xs">
          +{roles.length - 1} more
        </span>
      )}
    </div>
  );
}
