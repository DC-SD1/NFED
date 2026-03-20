import { Suspense } from "react";

import DashboardClient from "./_components/dashboard-client";

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
