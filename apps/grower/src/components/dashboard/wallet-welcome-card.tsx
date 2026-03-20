"use client";

import { Card, CardContent } from "@cf/ui";
import { useSession } from "@clerk/nextjs";
import { Copy, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { cn } from "@/lib/utils";

interface WelcomeCardProps {
  className?: string;
  walletId?: string;
}

export default function WalletWelcomeCard({
  className,
  walletId,
}: WelcomeCardProps) {
  const { session } = useSession();
  const authUser = useAuthUser();
  const userEmail =
    authUser.email || session?.user?.emailAddresses?.[0]?.emailAddress || "";
  const userName =
    session?.user?.firstName || userEmail.split("@")[0] || "User";
  const t = useTranslations("dashboard.welcomeCard");

  return (
    <Card className={cn("mb-2 w-full rounded-2xl border-none", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
            <h2 className="text-2xl font-semibold">
              {t("title", { userName })}
            </h2>
            {/* <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
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
            </div> */}
          </div>
          <div className="flex items-center gap-5">
            <p className="text-sm leading-relaxed text-gray-dark">
              {/* {t("subtitle")} */}
              Wallet ID : {walletId}
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center gap-2 rounded-full py-2">
                <Share2 className="size-4 cursor-pointer" color="#36B92E" />
              </div>
              <div className=" flex items-center gap-2 rounded-full py-2">
                <Copy className="size-4 cursor-pointer" color="#36B92E" />
              </div>
            </div>
          </div>

          <div className="mt-5"></div>
          {/* <div
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
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
