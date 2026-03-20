"use client";

import { Button } from "@cf/ui";
import { IconChevronDown } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { DocumentRow, DocumentSectionCard } from "./document-card";

interface DocumentDefinition {
  title: string;
  value: string;
  action?: "view" | "toggle";
}

const corporateIdentityDocuments: DocumentDefinition[] = [
  {
    title: "Business incorporation docs",
    value: "Uploadedfilename.jpeg",
  },
  {
    title: "Proof of business address",
    value: "Uploadedfilename.jpeg",
  },
  {
    title: "Corporate profile/ brochure",
    value: "Uploadedfilename.jpeg",
  },
];

const authorizedRepresentativeDocuments: DocumentDefinition[] = [
  {
    title: "ID of applicant",
    value: "Uploadedfilename.jpeg",
  },
  {
    title: "ID's of shareholders",
    value: "2",
    action: "toggle",
  },
  {
    title: "Certificate of incorporation",
    value: "Uploadedfilename.jpeg",
  },
];

const financialStandingDocuments: DocumentDefinition[] = [
  {
    title: "Audited financial statements (last 2 years)",
    value: "Uploadedaudited-financial-statements.jpeg",
  },
  {
    title: "Bank reference letter",
    value: "Uploadedbank-reference-letter.jpeg",
  },
  {
    title: "Credit rating report (if available)",
    value: "Uploadedcredit-rating-report.jpeg",
  },
  {
    title: "Proof of funds (bank statement or escrow confirmation)",
    value: "Uploadedproof-of-funds.jpeg",
  },
  {
    title: "Shipping records",
    value: "Uploadedshipping-records.jpeg",
  },
];

export function ProfileDocumentsOverview() {
  const t = useTranslations("settings.profile.buttons");

  const renderViewAction = () => (
    <Button
      variant="unstyled"
      className="text-primary hover:text-primary font-bold"
    >
      {t("view")}
    </Button>
  );

  const renderToggleAction = () => (
    <Button variant="unstyled">
      <IconChevronDown className="size-4" />
    </Button>
  );

  const resolveAction = (definition?: DocumentDefinition["action"]) => {
    if (definition === "toggle") {
      return renderToggleAction();
    }

    return renderViewAction();
  };
  return (
    <>
      <DocumentSectionCard title="Corporate identity" className="h-[332px]">
        {corporateIdentityDocuments.map((document) => (
          <DocumentRow
            key={document.title}
            title={document.title}
            value={document.value}
            action={resolveAction()}
          />
        ))}
      </DocumentSectionCard>

      <DocumentSectionCard
        title="Authorized representative"
        className="h-[332px]"
      >
        {authorizedRepresentativeDocuments.map((document) => (
          <DocumentRow
            key={document.title}
            title={document.title}
            value={document.value}
            action={resolveAction(document.action)}
          />
        ))}
      </DocumentSectionCard>

      <DocumentSectionCard
        title="Financial standing & liquidity"
        className="h-[590px] md:h-[492px]"
      >
        {financialStandingDocuments.map((document) => (
          <DocumentRow
            key={document.title}
            title={document.title}
            value={document.value}
            action={resolveAction()}
          />
        ))}
      </DocumentSectionCard>
    </>
  );
}
