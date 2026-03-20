import { Button } from "@cf/ui";
import {
  IconCircleCheckFilled,
  IconCircleFilled,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import kycRequirementsImage from "@/assets/images/kyc-requirements.png";
import type { Locale } from "@/config/i18n-config";

const kycRequirements = [
  {
    title: "Corporate Identity Verification",
    items: [
      "Business incorporation docs",
      "Proof of business address (optional)",
      "Corporate profile/ brochure (optional)",
    ],
  },
  {
    title: "Authorized Representative Verification",
    items: [
      "ID of applicant",
      "ID’s of shareholders",
      "Board Resolution or Power of Attorney (optional)",
    ],
  },
  {
    title: "Financial Standing & Liquidity",
    items: [
      "Audited Financial Statements (last 2 years)",
      "Bank Reference Letter",
      "Credit Rating Report (if available)",
      "Proof of Funds (bank statement or escrow confirmation for large contracts)",
      "Shipping records",
    ],
  },
];

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <div className="relative min-h-screen bg-gradient-to-l  from-[#001F29] to-[hsl(var(--text-dark))] py-10 text-white lg:h-screen lg:py-0">
      <div className="absolute right-4 top-4 z-50">
        <Button size="icon" className="rounded-full" asChild>
          <Link href={`/${locale}/home`}>
            <IconX />
          </Link>
        </Button>
      </div>
      <div className="absolute bottom-0 right-0 h-[500px] w-full md:h-[575px] md:w-[550px] lg:h-[720px] lg:w-[686px]">
        <Image
          src={kycRequirementsImage}
          alt="KYC Requirements"
          fill
          className="object-cover object-right-bottom"
          priority
        />
      </div>
      <div className="relative flex h-full flex-col justify-center">
        <div className="container">
          <div className="w-full lg:w-[920px]">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-bold">KYC Requirement Overview</h1>
              <p className="text-sm">
                Here is a list of all the required documents
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2">
              {kycRequirements.map((requirement) => (
                <div key={requirement.title}>
                  <div className="flex items-center gap-2">
                    <IconCircleCheckFilled className="size-6 text-[#6EFFE5]" />
                    <h2 className="text-base font-medium">
                      {requirement.title}
                    </h2>
                  </div>
                  <ul className="ml-7 mt-4 space-y-2">
                    {requirement.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 py-1">
                        <IconCircleFilled className="size-4 text-white" />
                        <span className="text-sm lg:whitespace-nowrap">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-10 flex w-full flex-col-reverse justify-between md:mt-20 md:w-[472px] md:gap-2 lg:flex-row lg:gap-0">
              <Button
                variant="ghost"
                className="lg:text-primary hover:text-primary/80 w-full px-0 font-semibold hover:bg-transparent md:bg-white md:text-[hsl(var(--text-dark))] lg:w-auto lg:bg-transparent"
                asChild
              >
                <Link href={`/${locale}/home`}>Do this later</Link>
              </Button>
              <Button
                className="w-full px-6 font-semibold md:px-12 lg:w-auto"
                asChild
              >
                <Link
                  href={`/${locale}/onboarding/basic-information/organisation-information`}
                >
                  Continue to KYC
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
