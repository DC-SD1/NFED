"use client";

import { Button, Card, CardContent } from "@cf/ui";
import { Checkbox } from "@cf/ui/components/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

interface AccordionSection {
  id: string;
  title: string;
  content: string;
}

export default function TermsAndConditionsClient() {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const [agreed, setAgreed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["1"]),
  );

  const sections: AccordionSection[] = [
    {
      id: "1",
      title: "Parties & Scope",
      content: `Complete Farmer LTD, a Ghanaian Limited Liability Company located at 11 Molade – Akiwumi Street, Airport West, Accra¹ ("Complete Farmer") and (Michael Essien), located at (Haatso) with (Idon'tknow) having (Ialsodon'tknow) number and (Idon'tknow ) ( IDK). The Grower and Complete Farmer are hereinafter sometimes referred to collectively as the "Parties" and individually as a "Party." This Agreement relates solely to the Produce listed in Schedule A, grown on the Land using Production Method Standards in Schedule C, and the Grower represents and warrants that it has all necessary title under Ghana's laws to cultivate and prepare the Produce.`,
    },
    {
      id: "2",
      title: "Duration/Term",
      content: `This Agreement shall start on the (23 October 2023) which shall be the first day of the Growing Period, (23 October) and shall remain in place until the last day of the Growing Period unless this Agreement has been terminated earlier in accordance with its terms.`,
    },
    {
      id: "3",
      title: "Quality Specifications",
      content: `Grower agrees to comply strictly with the quality Specifications and standards for the Produce as detailed in Schedule B. Complete Farmer may verify and control quality at its expense. The Parties agree that only Produce that meets the Specifications shall be sold on the Complete Farmer Platform. The Grower shall comply strictly to the Production Method Standards outlined in Schedule C of this Agreement. A breach of the Production Method Standards shall be treated as a material breach entitling Complete Farmer to terminate this Agreement without notice.`,
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleAgree = () => {
    if (!agreed) return;
    // TODO: Submit agreement to API
    console.log("User agreed to terms and conditions");
    // Navigate to OTP verification
    router.push(`/${locale}/transaction/otp-verification`);
  };

  return (
    <div className="container mx-auto flex w-full justify-center space-y-6 py-8">
      {/* Add Wallet heading */}

      <div className="flex w-3/4 max-w-4xl flex-col items-center gap-6">
        <Card className="w-full border-none bg-white">
          <CardContent className="p-8">
            <h1 className="mb-8 text-2xl font-semibold text-gray-900">
              Wallet Terms & Conditions (T&Cs) and regulatory agreements.
            </h1>

            {/* Accordion Sections - Scrollable Area */}
            <div className="mb-8 max-h-[400px] space-y-1 overflow-y-auto pr-2">
              {sections.map((section) => {
                const isExpanded = expandedSections.has(section.id);
                return (
                  <div
                    key={section.id}
                    className="border-b border-gray-200 pb-2"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-gray-700"
                    >
                      <h2 className="text-base font-medium text-gray-900">
                        {section.id}. {section.title}
                      </h2>
                      {isExpanded ? (
                        <ChevronUp className="size-5 shrink-0 text-[#22C55E]" />
                      ) : (
                        <ChevronDown className="size-5 shrink-0 text-gray-400" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="pb-6 pr-4">
                        <p className="text-sm leading-relaxed text-gray-600">
                          {section.content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Agreement Checkbox */}
            <div className="mb-6 flex items-center gap-3 rounded-lg  p-4">
              <Checkbox
                id="agree-terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="border-2 border-gray-300 data-[state=checked]:border-[#22C55E] data-[state=checked]:bg-[#22C55E]"
              />
              <label
                htmlFor="agree-terms"
                className="cursor-pointer text-base text-gray-700"
              >
                I have read and agree to the{" "}
                <span className="font-medium text-[#22C55E]">
                  terms and conditions
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleAgree}
                disabled={!agreed}
                className="h-12 w-full max-w-md rounded-lg bg-[#22C55E] text-base font-medium text-white transition-colors disabled:bg-[#E8F5E9] disabled:text-[#9E9E9E] disabled:opacity-100"
                size="lg"
              >
                Agree to terms and conditions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
