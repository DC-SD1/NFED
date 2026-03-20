"use client";

import { Checkbox, DialogTitle } from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import { Dialog, DialogContent } from "@cf/ui/components/dialog";
import { ChevronDown, ChevronLeft, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useModal } from "@/lib/stores/use-modal";

type AccordionState = Record<string, boolean>;

export default function TermsAndConditionsModal() {
  const { isOpen, onClose, type, data } = useModal();
  const [openSections, setOpenSections] = useState<AccordionState>({});
  const [isAgreed, setIsAgreed] = useState(false);
  const t = useTranslations("termsAndConditions");
  const router = useRouter();

  const isModalOpen = isOpen && type === "TermsAndConditions";

  if (!isModalOpen) return null;

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const formatContent = (content: string) => {
    return content.split("\n\n").map((paragraph, index) => (
      <p key={index} className="mb-3 last:mb-0">
        {paragraph.replace(/\n/g, " ")}
      </p>
    ));
  };

  const sections = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    title: t(`sections.${i}.title`),
    content: t(`sections.${i}.content`),
  }));

  const definitionsData = t.raw("definitions") || [];

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose} modal>
      <DialogTitle className="sr-only"></DialogTitle>
      <DialogContent className="mx-auto max-h-[90vh] w-[calc(100%-1rem)] overflow-y-auto rounded-3xl p-6 sm:max-w-xl md:max-w-4xl lg:max-w-5xl">
        <Button
          onClick={onClose}
          variant="default"
          className="absolute left-4 top-4 bg-transparent px-0 text-black hover:bg-transparent"
        >
          <ChevronLeft className="text-primary size-5" />
          Back
        </Button>

        <div className="flex flex-col pt-12">
          <div className="mb-6 w-full text-start sm:w-3/5">
            <h3 className="mb-4 text-xl font-bold">{t("title")}</h3>
          </div>

          <div className="mb-8 space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="border-b-gray-light border-b">
                <Button
                  variant="unstyled"
                  onClick={() => toggleSection(`section-${section.id}`)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors"
                >
                  <span className="whitespace-normal break-words text-sm font-thin">
                    {section.id}. {section.title}
                  </span>

                  {openSections[`section-${section.id}`] ? (
                    <ChevronUp className="text-primary size-5" />
                  ) : (
                    <ChevronDown className="text-primary size-5" />
                  )}
                </Button>
                {openSections[`section-${section.id}`] && (
                  <div className="px-4 pb-4">
                    <div className="text-sm leading-relaxed">
                      {formatContent(section.content)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mb-8">
            <div className="">
              <Button
                variant="unstyled"
                onClick={() => toggleSection("definitions")}
                className="flex w-full items-center justify-between p-4 text-left transition-colors"
              >
                <span className="text-sm font-thin">Definitions</span>
                {openSections.definitions ? (
                  <ChevronUp className="text-primary size-5" />
                ) : (
                  <ChevronDown className="text-primary size-5" />
                )}
              </Button>
              {openSections.definitions && (
                <div className="px-4 pb-4">
                  <div className="space-y-3">
                    {definitionsData.map((definition: any, index: number) => (
                      <div key={index} className=" pb-3">
                        <div className="mb-2">
                          <h4 className="text-sm  font-semibold">
                            {definition.term}
                          </h4>
                        </div>
                        <p className="text-sm leading-relaxed">
                          {definition.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-12">
            <div className="mb-6 flex items-start gap-3">
              <Checkbox
                id="agreement"
                checked={isAgreed}
                onCheckedChange={(checked) => setIsAgreed(!!checked)}
                className="text-primary focus:ring-primary mt-1 size-4 rounded border-gray-300"
              />
              <label
                htmlFor="agreement"
                className="cursor-pointer text-sm text-gray-700"
              >
                I have read and agree to the{" "}
                <span className="text-primary font-medium">
                  terms and conditions
                </span>
              </label>
            </div>
            <div className="flex w-full justify-center">
              <Button
                onClick={() => {
                  router.push(data?.termsAndConditionsLink ?? "");
                  setIsAgreed(false);
                  onClose();
                }}
                className=" w-3/4 rounded-xl py-2 "
                disabled={!isAgreed}
              >
                {t("signContract")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
