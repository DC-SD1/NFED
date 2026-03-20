import { Button, Card, CardContent } from "@cf/ui";
import { ChevronRight, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import FileCard from "@/components/documents-kyc-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetKyc } from "@/lib/queries/kyc-query";
import { getFileNameFromUrl } from "@/lib/utils/string-helpers";

interface FileProps {
  file_url: string;
  file_name: string;
  file_type: string | number;
  document_status: "Pending" | "Accepted" | "Declined";
}

type StatusCardMemo = {
  title: string;
  buttonText: string;
  buttonUrl: string;
  statusBadge: string;
  statusColor: string;
} & (
  | { isCompliant: false; message: string }
  | {
      isCompliant: true;
      isLocal: boolean;
      personal: FileProps[];
      certifications: FileProps[];
    }
);

export const AccountStatusCard = () => {
  const router = useRouter();
  const t = useTranslations("dashboard.profile.kycStatus");

  const { kycData, isLoading } = useGetKyc({ enabled: true });

  const uploadCertificate = () => {
    router.push("/farm-owner/kyc/certification");
  };

  const details = useMemo<StatusCardMemo>(() => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case t("status.compliant"):
          return "bg-primary text-white";
        case t("status.partiallyCompliant"):
          return "bg-yellow-dark ";
        case t("status.nonCompliant"):
        default:
          return "bg-red-light";
      }
    };

    if (!kycData?.value) {
      return {
        title: t("nonCompliantTitle"),
        isCompliant: false,
        message: t("nonCompliantMessage"),
        buttonText: t("nonCompliantButtonText"),
        buttonUrl: "/farm-owner/kyc",
        statusBadge: t("status.nonCompliant"),
        statusColor: getStatusColor(t("status.nonCompliant")),
      } satisfies StatusCardMemo;
    }

    const isLocal = !!kycData.value.kycType?.includes("Local");
    kycData.value.documents?.grower_intl_documents;
    const personal = (
      isLocal
        ? kycData.value.documents?.grower_local_documents
        : kycData.value.documents?.grower_intl_documents
    ) as FileProps[];

    // TODO: Fix once certification has been added to the backend
    const certifications: FileProps[] = [];
    if (kycData.value.documents?.certification) {
      certifications.push(kycData.value.documents?.certification as FileProps);
    }

    let statusBadge: string = t("status.nonCompliant");
    switch (kycData.value.kycStatus) {
      // TODO: Check if all documents have a status of accepted. Then mark as accepted
      case "Draft":
        statusBadge = t("status.partiallyCompliant");
        break;
      case "Submitted":
        statusBadge = t("status.compliant");
        break;
      default:
        break;
    }

    return {
      title: t("compliantTitle"),
      buttonText: t("partiallyCompliantButtonText"),
      buttonUrl: isLocal
        ? "/farm-owner/kyc/resident-edit"
        : "/farm-owner/kyc/international-edit",
      isCompliant: true,
      isLocal,
      personal,
      certifications,
      statusBadge,
      statusColor: getStatusColor(statusBadge),
    } satisfies StatusCardMemo;
  }, [kycData, t]);

  return (
    <Card className="w-full rounded-xl border-none bg-white shadow-2xl">
      <CardContent className="p-6">
        {isLoading ? (
          <AccountStatusSkeleton />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-md font-semibold leading-none">
                {details.title}
              </h2>

              <span
                className={`rounded-full p-0 px-2 text-xs font-thin ${details.statusColor}`}
              >
                {details.statusBadge}
              </span>
            </div>

            {details.isCompliant ? (
              <>
                <p className="mb-3">{t("personalDocumentsTitle")}</p>
                <div className="mb-6 flex flex-col gap-2">
                  {details.personal.map((doc, index) => (
                    <FileCard
                      key={`${doc.file_url}-${index}`}
                      filename={
                        getFileNameFromUrl(doc?.file_url || "") ||
                        doc?.file_name ||
                        ""
                      }
                      fileType={doc?.file_type?.toString() || ""}
                      onRemove={() => {
                        router.push(details.buttonUrl);
                      }}
                    />
                  ))}
                </div>

                <p className="mb-3">{t("certificateDocumentsTitle")}</p>
                {details.certifications.length ? (
                  <div className="mb-8 flex flex-col gap-2">
                    {details.certifications.map((doc, index) => (
                      <FileCard
                        key={`${doc.file_url}-${index}`}
                        filename={
                          getFileNameFromUrl(doc?.file_url || "") ||
                          doc?.file_name ||
                          ""
                        }
                        fileType={doc?.file_type?.toString() || ""}
                        onRemove={() => {
                          router.push("/farm-owner/kyc/certification");
                        }}
                        displayBadge
                        badge={doc.document_status}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mb-8 flex max-w-2xl flex-col items-center justify-center gap-2 rounded-xl border border-input-border py-6">
                    <p>{t("noCertificateUploaded")}</p>
                    <Button
                      onClick={uploadCertificate}
                      variant="default"
                      className="rounded-lg"
                    >
                      <span className="text-sm font-bold">
                        {t("noCertificateUploadButtonText")}
                      </span>
                      <PlusIcon strokeWidth={3} className="size-4 text-white" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="mb-8 shrink-0 text-xs text-gray-dark">
                {details.message}
              </p>
            )}

            <Button
              variant="default"
              className="w-3/12 justify-center text-center lg:w-3/12"
              onClick={() => router.push(details.buttonUrl)}
            >
              <span className="text-sm font-bold">{details.buttonText}</span>
              <ChevronRight className="size-5" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const AccountStatusSkeleton: React.FC = () => (
  <>
    <div className="mb-5 flex items-center justify-between">
      <Skeleton className="h-4 w-60" />
      <Skeleton className="h-3 w-24" />
    </div>

    <Skeleton className="mb-3 h-4 w-52" />

    <div className="mb-6 flex w-full flex-col gap-2">
      {new Array(3).fill(null).map((_, index) => (
        <div
          className="flex flex-row items-center gap-4 rounded-xl border border-input-border/50 px-4 py-7"
          key={index}
        >
          <Skeleton className="size-6" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-2 w-20" />
          </div>
          <Skeleton className="size-8 rounded-full" />
        </div>
      ))}
    </div>
  </>
);
