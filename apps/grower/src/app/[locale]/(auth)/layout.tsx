"use client";

import { cn } from "@cf/ui";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useState } from "react";

import lightLogo from "@/assets/images/header-logo-light.png";
// Import the images
import onboarding1 from "@/assets/images/onbaording-1.jpg";
import onboarding2 from "@/assets/images/onboarding-2.jpg";
import onboarding3 from "@/assets/images/onboarding-3.jpg";
import onboarding4 from "@/assets/images/onboarding-4.jpg";

const carouselImages = [onboarding1, onboarding2, onboarding3, onboarding4];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const pathname = usePathname();
  const t = useTranslations("landing.carousel");
  const tAlt = useTranslations("alt");

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
    {
      title: t("slide4.title"),
      subtitle: t("slide4.subtitle"),
      image: carouselImages[3],
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
        "min-h-screen bg-white lg:grid lg:grid-cols-2",
        isOtpPage && "bg-primary lg:bg-white",
      )}
    >
      {/* Left side - Hero section with carousel (hidden on mobile and tablet) */}
      <div className="relative m-2 hidden overflow-hidden rounded-2xl md:hidden lg:m-4 lg:flex lg:flex-col lg:justify-between lg:rounded-2xl">
        {/* <div className="absolute inset-0 bg-gradient-to-br opacity-95 to-primary-600 from-primary" /> */}

        {/* Background image */}
        <div className="absolute inset-0">
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
        <div className="w-full; relative z-10 p-6 pb-12 lg:p-8 lg:pb-16">
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
          {/* Pagination dots */}
          <div className="flex w-full items-center justify-center gap-2">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
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
        <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
          <div className="flex w-full max-w-sm items-center justify-center md:max-w-lg lg:max-w-2xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
