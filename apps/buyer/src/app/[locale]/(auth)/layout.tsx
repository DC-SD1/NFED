"use client";

import { cn } from "@cf/ui";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useState } from "react";

import AuthPattern from "@/assets/images/backgrounds/auth-pattern.png";
import buyerAuthLogo from "@/assets/images/logos/buyer-auth-logo.png";
import buyerAuthLogoLight from "@/assets/images/logos/buyer-auth-logo-light.png";
// Import the images
import onboarding1 from "@/assets/images/onboarding-1.jpg";
import onboarding2 from "@/assets/images/onboarding-2.jpg";
import onboarding3 from "@/assets/images/onboarding-3.jpg";

const carouselImages = [onboarding1, onboarding2, onboarding3];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const pathname = usePathname();
  const t = useTranslations("landing.carousel");
  const tAlt = useTranslations("alt");
  const tAuthFlow = useTranslations("authFlow");

  // Check if we're on an OTP page
  const isOtpPage = pathname.includes("/otp");

  // Create carousel slides with translations
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
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  return (
    <div
      className={cn(
        "min-h-screen overflow-hidden bg-white md:h-screen lg:grid lg:grid-cols-2",
        isOtpPage && "bg-primary-dark lg:bg-white",
      )}
    >
      {/* Left side - Hero section with carousel (hidden on mobile and tablet) */}
      <div className="bg-primary-dark relative hidden h-screen w-full flex-col items-center justify-center overflow-hidden lg:flex">
        {/* <div className="absolute inset-0 bg-gradient-to-br opacity-95 to-primary-600 from-primary" /> */}

        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={AuthPattern}
            alt={tAlt("cf")}
            className="size-full object-cover"
            priority
          />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_69.68%_69.68%_at_50.00%_50.00%,hsl(var(--text-dark))_53%,rgba(0,45,43,0)_100%)]" />

        <div className="flex h-full w-[473px] flex-col justify-center gap-16">
          {/* Logo and navigation */}
          <div className="relative">
            <Image
              src={buyerAuthLogo}
              alt={tAlt("cfGrowerLogo")}
              className="object-cover"
              priority
              width={200}
              height={20}
            />
          </div>

          {/* Carousel */}
          <div>
            <div className="relative h-[280px] w-[470px]">
              <Image
                src={
                  carouselSlides[currentSlide]?.image ||
                  "/src/assets/images/onboarding-4.jpg"
                }
                alt={tAlt("cf")}
                className="size-full rounded-xl border-2 border-white object-cover"
                priority
              />
              <div className="absolute -bottom-10 left-14 w-[440px] rounded-xl bg-white p-4">
                <p className="font-semibold">
                  {carouselSlides[currentSlide]?.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 w-full space-y-6">
            {/* Pagination dots */}
            <div className="flex w-full gap-2">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`size-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-[#6EFFE5]" : "bg-[#6EFFE5]/50"
                  }`}
                />
              ))}
            </div>

            <h1 className="mb-3 text-3xl font-bold leading-tight text-white transition-all duration-500 lg:mb-4 lg:text-4xl xl:text-5xl">
              {/* {carouselSlides[currentSlide]?.title} */}
              {tAuthFlow("title")}
            </h1>
            <p className="mb-6 text-base text-white/90 transition-all duration-500 lg:mb-8 lg:text-lg">
              {tAuthFlow("description")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Right side - Auth content */}
        {/* <div className="flex justify-center items-center p-4 min-h-full sm:p-6 md:p-8 lg:p-12">
          <div className="w-full min-w-full max-w-full sm:max-w-md">
            {children}
          </div>
        </div> */}
        {/* <div className="flex flex-1 justify-center items-center p-6 bg-white lg:p-12">
          <div className="items-center w-full max-w-sm md:max-w-lg lg:max-w-2xl">
            {children}
          </div>
        </div> */}
        {/* <div className="flex flex-1 justify-center items-center p-6 lg:p-12">
          <div className="flex justify-center items-center w-full max-w-sm md:max-w-lg lg:max-w-2xl">
            {children}
          </div>
        </div> */}
        <div className="flex h-full items-center justify-center p-6 lg:p-12">
          <div className="mx-auto w-full max-w-sm md:max-w-lg">
            <div className="space-y-10 py-4 md:py-3 lg:space-y-0 lg:py-0">
              <div className="relative lg:hidden">
                <Image
                  src={buyerAuthLogoLight}
                  alt={tAlt("cfGrowerLogo")}
                  className="object-cover"
                  priority
                  width={200}
                  height={20}
                />
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
