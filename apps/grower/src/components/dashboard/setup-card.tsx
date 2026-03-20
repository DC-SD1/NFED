"use client";

import { Button, Card, CardContent, CardHeader } from "@cf/ui";
import { Check, ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface SetupCardProps {
  hasSignedUp: boolean;
  hasAddedFarmLand: boolean;
  hasInvitedFarmManager: boolean;
  hasAddedFarmPlan: boolean;
}

export function SetupCard({
  hasSignedUp,
  hasAddedFarmLand,
  hasInvitedFarmManager,
  hasAddedFarmPlan,
}: SetupCardProps) {
  const t = useTranslations("dashboard.emptyState");
  const router = useRouter();

  // Calculate progress percentage
  const steps = [hasSignedUp, hasAddedFarmLand, hasInvitedFarmManager];
  const completedSteps = steps.filter(Boolean).length;
  const totalSteps = 4; // Including the final "Start" step
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <Card className="h-content w-full rounded-2xl border-none py-10">
      <div className="h-content mx-auto flex max-w-2xl flex-col items-center justify-center">
        <CardHeader className="flex w-full items-start gap-4">
          <div className="flex flex-col text-start">
            <h1 className="mb-3 text-2xl font-semibold">
              {t("dashboardTitle", { progress: progressPercentage })}
            </h1>

            <div className="mb-5 flex items-center gap-2">
              <div className="bg-primary-light h-2 w-full overflow-hidden rounded-full lg:w-1/2">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-foreground text-sm ">
                {progressPercentage}%
              </span>
            </div>

            <p className="text-foreground max-w-md text-sm leading-relaxed">
              {t("dashDescription")}
            </p>
          </div>

          <div className="bg-primary-light h-px w-[99%] md:w-full" />
        </CardHeader>

        {/* <div className="mb-10 h-px w-full bg-gray-300" /> */}

        <div className="grid w-full grid-cols-1 gap-6 px-4 md:grid-cols-2">
          {/* Card 1 - Sign Up Status */}
          <Card className="rounded-2xl border-0 drop-shadow-2xl">
            <CardContent className="relative p-6">
              {hasSignedUp ? (
                <>
                  <div className="mb-20 flex items-center gap-3">
                    <div className="bg-primary flex size-6 items-center justify-center rounded-full">
                      <Check className="size-4 text-white" />
                    </div>
                    <h3 className="text-base">{t("steps.login.title")}</h3>
                  </div>
                  <span className="text-primary absolute bottom-6 right-6 text-sm">
                    {t("steps.login.status")}
                  </span>
                </>
              ) : (
                <>
                  <h3 className="mb-10 text-base">{t("steps.login.title")}</h3>
                  <Button
                    onClick={() => router.push("/auth/signup")}
                    className="bg-primary rounded-2xl text-sm text-white"
                  >
                    {t("steps.login.title")}
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Add Land */}
          <Card className="rounded-2xl border-0 drop-shadow-2xl">
            <CardContent className={hasAddedFarmLand ? "relative p-6" : "p-6"}>
              {hasAddedFarmLand ? (
                <>
                  <div className="mb-20 flex items-center gap-3">
                    <div className="bg-primary flex size-6 items-center justify-center rounded-full">
                      <Check className="size-4 text-white" />
                    </div>
                    <h3 className="text-base">{t("steps.addLand.title")}</h3>
                  </div>
                  <span className="text-primary absolute bottom-6 right-6 text-sm">
                    {t("steps.login.status")}
                  </span>
                </>
              ) : (
                <>
                  <h3 className="mb-10 text-base">
                    {t("steps.addLand.title")}
                  </h3>
                  <Button
                    onClick={() => router.push("/farm-owner/farm-lands")}
                    className="bg-primary rounded-2xl text-sm text-white"
                    disabled={!hasSignedUp}
                  >
                    {t("steps.addLand.title")}
                    <Plus className="ml-2 size-4" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Add Manager */}
          <Card className="rounded-2xl border-0 drop-shadow-2xl">
            <CardContent
              className={hasInvitedFarmManager ? "relative p-6" : "p-6"}
            >
              {hasInvitedFarmManager ? (
                <>
                  <div className="mb-20 flex items-center gap-3">
                    <div className="bg-primary flex size-6 items-center justify-center rounded-full">
                      <Check className="size-4 text-white" />
                    </div>
                    <h3 className="text-base">{t("steps.addManager.title")}</h3>
                  </div>
                  <span className="text-primary absolute bottom-6 right-6 text-sm">
                    {t("steps.login.status")}
                  </span>
                </>
              ) : (
                <>
                  <h3 className="mb-10 text-base">
                    {t("steps.addManager.title")}
                  </h3>
                  <Button
                    onClick={() => router.push("/farm-owner/farm-managers")}
                    className="bg-primary rounded-2xl px-4 text-sm text-white"
                    disabled={!hasSignedUp || !hasAddedFarmLand}
                  >
                    {t("steps.addManager.title")}
                    <Plus className="ml-2 size-4" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Start Action - redirects to select-land */}
          <Card className="rounded-2xl border-0 drop-shadow-2xl">
            <CardContent className="p-6">
              {hasAddedFarmPlan ? (
                <>
                  <div className="mb-20 flex items-center gap-3">
                    <div className="bg-primary flex size-6 items-center justify-center rounded-full">
                      <Check className="size-4 text-white" />
                    </div>
                    <h3 className="text-base">{t("steps.start.title")}</h3>
                  </div>
                  <span className="text-primary absolute bottom-6 right-6 text-sm">
                    {t("steps.login.status")}
                  </span>
                </>
              ) : (
                <>
                  <h3 className="mb-10 text-base">{t("steps.start.title")}</h3>
                  <Button
                    onClick={() =>
                      router.push("/farm-owner/farm-plan/select-land")
                    }
                    className="bg-primary rounded-2xl px-4 text-sm text-white"
                    disabled={
                      !hasSignedUp ||
                      !hasAddedFarmLand ||
                      !hasInvitedFarmManager
                    }
                  >
                    {t("steps.start.action")}
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Card>
  );
}
