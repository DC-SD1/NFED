"use client";

import { Card, CardContent } from "@cf/ui";
import { CalendarIcon, Sun } from "@cf/ui/icons";
import { useSession } from "@clerk/nextjs";
import { Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { cn } from "@/lib/utils";

interface WelcomeCardProps {
  showProgress?: boolean;
  className?: string;
  currentDate?: string;
  condition?: string;
  temperature?: number;
  stepsComplete?: number;
}

export default function WelcomeCard({
  showProgress,
  currentDate,
  condition,
  temperature,
  className,
  stepsComplete = 1,
}: WelcomeCardProps) {
  const { session } = useSession();
  const authUser = useAuthUser();
  const userEmail =
    authUser.email || session?.user?.emailAddresses?.[0]?.emailAddress || "";
  const userName =
    session?.user?.firstName || userEmail.split("@")[0] || "User";
  const t = useTranslations("dashboard.welcomeCard");

  return (
    <Card className={cn("w-full rounded-2xl border-none", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
            <h2 className="text-2xl font-semibold">
              {t("title", { userName })}
            </h2>
            <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
              <div className="bg-gray-light flex items-center gap-2 rounded-full px-3 py-2">
                <CalendarIcon />
                <span className="whitespace-nowrap text-sm font-normal">
                  {currentDate}
                </span>
              </div>
              <div className="bg-gray-light flex items-center gap-2 rounded-full px-3 py-2">
                <Sun className="size-4" />
                <span className="whitespace-nowrap text-sm font-normal">
                  {condition}
                </span>
              </div>
              <div className="bg-gray-light flex items-center gap-2 rounded-full px-3 py-2">
                <span className="whitespace-nowrap text-sm font-normal">
                  {temperature}°C
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-dark text-sm leading-relaxed">
            {t("subtitle")}
          </p>

          <div
            className={cn(
              "mt-4 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:items-center",
              showProgress ? "sm:justify-between" : "sm:justify-start",
            )}
          >
            {showProgress && (
              <div>
                <p className="text-primary text-lg font-medium">
                  {t("completedSteps", { stepsComplete })}
                </p>
              </div>
            )}

            {showProgress ? (
              <div className={cn("text-left", showProgress && "sm:text-right")}>
                <p className="text-sm font-semibold">{t("needHelp")}</p>
                <p className="text-sm font-normal">
                  {t("contactSupport")}{" "}
                  <span className="text-primary">+233 99 999 9999</span>
                </p>
              </div>
            ) : (
              <>
                <div className="hidden items-center gap-4 lg:flex">
                  <p className="text-sm font-semibold">{t("contactSupport")}</p>
                  <div className="text-primary flex items-center gap-2">
                    <Mail className="size-4" aria-hidden />
                    <a
                      href="mailto:support@completefarmer.com"
                      className="text-sm font-semibold"
                    >
                      support@completefarmer.com
                    </a>
                  </div>
                  <div className="text-primary flex items-center gap-2">
                    <Phone className="size-4" aria-hidden />
                    <a
                      href="tel:+233999999999"
                      className="text-sm font-semibold"
                    >
                      +233 99 999 9999
                    </a>
                  </div>
                </div>
                <div className="sm:text-right lg:hidden">
                  <p className="text-sm font-semibold">{t("needHelp")}</p>
                  <p className="text-sm font-normal">
                    {t("contactSupport")}{" "}
                    <span className="text-primary">+233 99 999 9999</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
