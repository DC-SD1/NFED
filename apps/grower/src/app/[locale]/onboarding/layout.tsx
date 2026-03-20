"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import lightLogo from "@/assets/images/header-logo-light.png";
import onboarding1 from "@/assets/images/onbaording-1.jpg";
import onboarding2 from "@/assets/images/onboarding-2.jpg";
import onboarding3 from "@/assets/images/onboarding-3.jpg";
import onboarding4 from "@/assets/images/onboarding-4.jpg";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";

const carouselImages = [onboarding1, onboarding2, onboarding3, onboarding4];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations("landing.carousel");
  const tAlt = useTranslations("alt");
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselSlides = [
    {
      title: t("slide1.title"),
      subtitle: t("slide1.subtitle"),
      image: carouselImages[0],
    },
    {
      title: t("slide2.title"),
      subtitle: t("slide2.subtitle"),
      image: carouselImages[1],
    },
    {
      title: t("slide3.title"),
      subtitle: t("slide3.subtitle"),
      image: carouselImages[2],
    },
    {
      title: t("slide4.title"),
      subtitle: t("slide4.subtitle"),
      image: carouselImages[3],
    },
  ];
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const isCompletePage = /\/onboarding\/(?:newbie|experienced)\/complete$/.test(
    pathname,
  );
  return (
    <OnboardingProvider>
      <div className="h-screen overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden">
          <OnboardingHeader />
        </div>

        {/* Main content - Desktop layout */}
        <div className="hidden min-h-screen lg:flex">
          {/* Left side - Info panel (desktop only) */}
          <div className="fixed left-0 top-0 z-10 m-4 hidden h-[96%] w-1/2 overflow-hidden rounded-2xl lg:flex lg:flex-col lg:justify-between xl:w-1/2">
            {/* Background image */}
            <div className="absolute inset-0 overflow-hidden rounded-b-2xl">
              <Image
                src={
                  carouselSlides[currentSlide]?.image ||
                  "/src/assets/images/onboarding-4.jpg"
                }
                alt={tAlt("cf")}
                className="size-full object-cover"
                priority
              />
            </div>

            {/* Logo and navigation */}
            <div className="relative z-10 p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <Image
                  src={lightLogo}
                  alt={tAlt("cfGrowerLogo")}
                  className="object-cover"
                  priority
                  width={200}
                  height={20}
                />
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 pb-12 lg:p-8 lg:pb-16">
              <h1 className="mb-3 text-3xl font-bold leading-tight text-white transition-all duration-500 lg:mb-4 lg:text-4xl xl:text-5xl">
                {/* {carouselSlides[currentSlide]?.title} */}
                {carouselSlides[currentSlide]?.title
                  .split(".")
                  .filter(Boolean) // remove empty segments
                  .map((part, index, arr) => (
                    <span key={index}>
                      {part.trim()}.{index < arr.length - 1 && <br />}
                    </span>
                  ))}
              </h1>
              <p className="mb-6 text-base text-white/90 transition-all duration-500 lg:mb-8 lg:text-lg">
                {carouselSlides[currentSlide]?.subtitle}
              </p>
              <div className="flex w-full items-center justify-center gap-2">
                {carouselSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "w-8 bg-white"
                        : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <main className="ml-[calc(50%+2rem)] mr-8 flex flex-1 flex-col justify-start pr-4 xl:pr-6">
            <div className="sticky top-0 z-30 w-full bg-white">
              <OnboardingHeader />
            </div>
            <div className="flex flex-1 justify-center px-4 sm:px-6">
              <div className="w-full max-w-xl grow space-y-6">{children}</div>
            </div>
          </main>
        </div>

        <div className="flex h-full flex-col overflow-hidden lg:hidden">
          <div
            className={`bg- flex h-full flex-col overflow-hidden${isCompletePage ? "primary" : "white"}`}
          >
            <div className="flex flex-1 flex-col overflow-hidden p-4">
              <div className="flex h-full flex-col overflow-y-auto">
                <div className="shrink-0 space-y-4">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingProvider>
  );
}
