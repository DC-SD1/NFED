// Backward compatibility wrapper
// This file provides a default EmptyState component for components that haven't been updated yet

import { SetupCard } from "./setup-card";

export function EmptyState() {
  // Provide default values for backward compatibility
  return (
    <SetupCard
      hasAddedFarmPlan={false}
      hasSignedUp={false}
      hasAddedFarmLand={false}
      hasInvitedFarmManager={false}
    />
  );
}
