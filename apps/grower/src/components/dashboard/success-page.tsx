"use client";

import { Button } from "@cf/ui/components/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import balloons from "@/assets/images/balloons.png";
import lightLogo from "@/assets/images/header-logo-light.png";

interface SuccessPageProps {
  title: string;
  description: string;
  subtitle?: string;
  doneText: string;
  redirectUrl: string;
  icon?: ReactNode;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  secondaryUnstyled?: boolean;
}

const SuccessPage = ({
  title,
  description,
  subtitle,
  doneText,
  redirectUrl,
  icon,
  secondaryButtonText,
  secondaryButtonUrl,
  secondaryUnstyled = false,
}: SuccessPageProps) => {
  const router = useRouter();

  const handleStart = () => {
    router.replace(redirectUrl);
  };

  const handleSecondaryAction = () => {
    if (secondaryButtonUrl) {
      router.replace(secondaryButtonUrl);
    }
  };

  return (
    <>
      {/* Mobile and Tablet Layout */}
      <div className="flex min-h-screen flex-col bg-primary py-16 md:hidden">
        <div className="mt-5 flex justify-center">
          <Image
            src={lightLogo}
            alt="CF Grower Logo"
            width={200}
            height={100}
            priority
          />
        </div>

        <div className="mt-6 flex flex-1 items-start justify-center p-1">
          <div className="w-full max-w-sm space-y-14 rounded-3xl bg-[#f3f7f2] p-4 text-center shadow-lg">
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
              <h1 className="w-full text-2xl font-bold tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-md text-center text-muted-foreground">
                  {subtitle}
                </p>
              )}
              <p className="text-md text-center text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <Button
                className="h-14 w-full rounded-2xl bg-primary font-semibold text-white hover:bg-primary/90"
                onClick={handleStart}
              >
                {doneText}
                {icon}
              </Button>
              {secondaryButtonText && secondaryButtonUrl && (
                <Button
                  className={
                    secondaryUnstyled
                      ? "mt-4  w-full rounded-xl bg-transparent text-primary hover:bg-transparent"
                      : "mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary p-4 font-semibold text-white shadow-md transition-colors duration-200"
                  }
                  onClick={handleSecondaryAction}
                >
                  {secondaryButtonText}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden items-center justify-center overflow-hidden px-2 py-40 md:flex">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="flex justify-center">
            <Image
              src={balloons || "/placeholder.svg"}
              alt="Congratulations balloons"
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
          <div className="space-y-7">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-md text-center text-muted-foreground">
                {subtitle}
              </p>
            )}
            <p className="text-md text-center text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="pt-5">
            <Button
              className="flex w-full flex-row items-center justify-center gap-2 rounded-2xl bg-primary p-4 font-semibold text-white shadow-md transition-colors duration-200"
              onClick={handleStart}
            >
              {doneText}
              {icon}
            </Button>

            {secondaryButtonText && secondaryButtonUrl && (
              <Button
                className={
                  secondaryUnstyled
                    ? "mt-4  w-full rounded-xl bg-transparent text-primary hover:bg-transparent"
                    : "mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary p-4 font-semibold text-white shadow-md transition-colors duration-200"
                }
                onClick={handleSecondaryAction}
              >
                {secondaryButtonText}
                {icon}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessPage;
