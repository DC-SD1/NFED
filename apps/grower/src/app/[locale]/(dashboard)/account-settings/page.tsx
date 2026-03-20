"use client";

import { Button } from "@cf/ui";
import { useSession } from "@clerk/nextjs";
import { parseAsStringEnum, useQueryState } from "nuqs";

import { NotificationSettingComing } from "@/components/dashboard/coming-soon-card";
import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";

type TabType = "general" | "payment";

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringEnum<TabType>(["general", "payment"]).withDefault("general"),
  );

  const authUser = useAuthUser();
  const { session } = useSession();
  const userEmail =
    authUser.email || session?.user?.emailAddresses?.[0]?.emailAddress || "";

  const tabs = [
    { id: "payment" as TabType, label: "Payment settings" },
    { id: "general" as TabType, label: "General setting" },
  ];

  const renderGeneralSettings = () => (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="order-2 lg:order-1">
        <NotificationSettingComing />
      </div>

      <div className="order-2 lg:order-1">
        <ChangePasswordForm
          userEmail={userEmail}
          submitButtonText="Update Password"
        />
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="flex h-full items-center justify-center">
      <div className="m-auto text-center">
        <h1 className="text-gray-dark text-4xl font-bold">Coming Soon</h1>
      </div>
    </div>
  );

  return (
    <TopLeftHeaderLayout>
      <div className="mb-20 flex flex-col gap-4 px-2 md:px-4 xl:mb-0">
        <div className="border-b border-gray-200">
          <nav className="mb-px flex space-x-3">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="unstyled"
                onClick={() => setActiveTab(tab.id)}
                className={`text-gray-dark whitespace-nowrap rounded-none border-b-2 p-0 px-1 text-sm font-thin ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent"
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "payment" && renderPaymentSettings()}
          {activeTab === "general" && renderGeneralSettings()}
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
