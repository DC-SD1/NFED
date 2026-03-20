"use client";

import { Button } from "@cf/ui/components/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { use } from "react";

import balloons from "@/assets/images/balloons.png";
import lightLogo from "@/assets/images/header-logo-light.png";

const CompletePage = ({ params }: { params: Promise<{ locale: string }> }) => {
  const router = useRouter();
  const { locale: _ } = use(params);
  const t = useTranslations("onboarding.newbie.complete");

  const handleStart = () => {
    router.push("/farm-owner");
  };

  return (
    <>
      {/* Mobile and Tablet Layout*/}
      <div className="flex items-center justify-center lg:hidden">
        <Image
          src={lightLogo}
          alt="CF Grower Logo"
          width={200}
          height={20}
          priority
        />
      </div>
      <div className="bg-primary flex min-h-screen flex-col lg:hidden">
        <div className="mt-20 flex flex-1 items-start justify-center p-1">
          <div className="w-full max-w-sm space-y-14 rounded-3xl bg-white p-4 text-center shadow-lg">
            <div className="flex justify-center">
              <Image
                src={balloons || "/placeholder.svg"}
                alt="Congratulations balloons"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">{t("done")}</h1>
              <p className="text-sm leading-relaxed text-gray-600">
                {t("title")}
              </p>
            </div>
            <div className="pt-2">
              <Button
                className="bg-primary flex w-full items-center justify-center gap-2 rounded-2xl p-4 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-600"
                onClick={handleStart}
              >
                {t("start")}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop Layout */}
      <div className="hidden items-center justify-center overflow-hidden px-2 py-40 lg:flex">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="flex justify-center">
            <Image
              src={balloons || "/placeholder.svg"}
              alt="Congratulations balloons"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <div className="space-y-7">
            <h1 className="text-2xl font-bold text-gray-900">{t("done")}</h1>
            <p className="text-sm leading-relaxed text-gray-600">
              {t("title")}
            </p>
          </div>
          <div className="pt-5">
            <Button
              className="bg-primary flex w-full items-center justify-center gap-2 rounded-2xl p-4 font-semibold text-white shadow-md transition-colors duration-200"
              onClick={handleStart}
            >
              {t("start")}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompletePage;
