"use client";

import { useTranslations } from "next-intl";

import { ROLES } from "@/lib/schemas/auth";

import { RoleGuard } from "../auth/role-guard";
import { RoleBasedContent } from "./role-based-content";

export function DashboardContent() {
  const t = useTranslations("dashboard");

  const farmerDashboard = (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Welcome back, Farmer!</h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your farming operations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">{t("nav.farmer.farms")}</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage your farm properties and locations
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">{t("nav.farmer.crops")}</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Track your crop planning and progress
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">{t("nav.farmer.activities")}</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Log and monitor farming activities
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">{t("nav.farmer.analytics")}</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            View insights and performance metrics
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">Weather</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Current weather conditions for your farms
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">Market Prices</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Latest commodity prices and trends
          </p>
        </div>
      </div>
    </div>
  );

  const agentDashboard = (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Welcome back, Agent!</h2>
        <p className="text-muted-foreground">
          Manage your territory and support your farmer clients
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">{t("nav.agent.clients")}</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage and support your farmer clients
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">{t("nav.agent.territory")}</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            View farms and clients in your territory
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">{t("nav.agent.performance")}</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Track your performance and targets
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">{t("nav.agent.training")}</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Access agent training and materials
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">Client Status</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Overview of client activities and alerts
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">Territory Goals</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Progress towards territory objectives
          </p>
        </div>
      </div>
    </div>
  );

  const defaultDashboard = (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Welcome to the Dashboard</h2>
        <p className="text-muted-foreground">General dashboard content</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">Overview</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            General system overview
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold">Profile</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage your profile settings
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>

      <RoleBasedContent
        farmerContent={farmerDashboard}
        agentContent={agentDashboard}
        defaultContent={defaultDashboard}
      />

      {/* Example of role-specific content using RoleGuard */}
      <RoleGuard allowedRoles={[ROLES.FARM_OWNER]}>
        <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
          <h3 className="font-semibold text-green-800 dark:text-green-200">
            Farmer Owner-Only Feature
          </h3>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            This content is only visible to users with the FarmOwner role.
          </p>
        </div>
      </RoleGuard>

      <RoleGuard allowedRoles={["Agent"]}>
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200">
            Agent-Only Feature
          </h3>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
            This content is only visible to users with the Agent role.
          </p>
        </div>
      </RoleGuard>
    </div>
  );
}
