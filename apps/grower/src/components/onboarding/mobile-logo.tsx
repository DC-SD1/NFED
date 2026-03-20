"use client";

interface CFMobileLogoProps {
  isCompletePage: boolean;
}

export function CFMobileLogo({ isCompletePage }: CFMobileLogoProps) {
  const colorClass = isCompletePage ? "text-white" : "text-primary";

  return (
    <div className="mt-4 flex flex-row items-center justify-center">
      <span className={`${colorClass} text-lg font-bold`}>C</span>
      <span className={`${colorClass} mr-1 pb-1 text-3xl font-thin`}>|</span>
      <span className={`${colorClass} text-xl font-semibold`}>CF Grower</span>
    </div>
  );
}
