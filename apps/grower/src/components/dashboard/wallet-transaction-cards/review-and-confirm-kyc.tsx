"use client";

import { Button } from "@cf/ui";
import { Info } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import KycDocumentsCard from "@/components/dashboard/wallet-transaction-cards/kyc-documents-cards";
import PersonalDetailsReviewCard from "@/components/dashboard/wallet-transaction-cards/personal-details";
import ResidentialAddressReviewCard from "@/components/dashboard/wallet-transaction-cards/residential-address";
import { KYC_MIN_DOCUMENTS_REQUIRED } from "@/lib/constants/wallet";

import KycSubmitDocuments from "./kyc-submit-documents-card";

export default function ReviewAndConfirmKyc() {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const [hasProfilePicture, setHasProfilePicture] = useState(false);
  const [hasKycDocuments, setHasKycDocuments] = useState(false);
  const [hasResidentialAddress] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [missingRequirements, setMissingRequirements] = useState<string[]>([]);

  useEffect(() => {
    const complete =
      hasProfilePicture && hasKycDocuments && hasResidentialAddress;
    setIsComplete(complete);

    const missing: string[] = [];
    if (!hasProfilePicture) {
      missing.push(
        "Upload your profile photo in order to activate your wallet",
      );
    }
    if (!hasResidentialAddress) {
      missing.push("Update your residential address");
    }
    if (!hasKycDocuments) {
      missing.push("Upload KYC documents (ID and utility bill)");
    }
    setMissingRequirements(missing);
  }, [hasProfilePicture, hasKycDocuments, hasResidentialAddress]);

  const handleProfilePictureUpload = useCallback(() => {
    setHasProfilePicture(true);
  }, []);

  const handleKycDocumentsUpdate = useCallback((documents: any[]) => {
    setHasKycDocuments(documents.length >= KYC_MIN_DOCUMENTS_REQUIRED);
  }, []);

  const handleConfirmAndContinue = () => {
    router.push(`/${locale}/transaction/terms-and-conditions`);
  };

  return (
    <div className="container mx-auto flex w-full justify-center space-y-6 py-6">
      <div className="flex w-3/4 flex-col items-center gap-6">
        <h2 className="text-2xl font-bold">Review and confirm KYC</h2>
        <PersonalDetailsReviewCard
          firstName={"John"}
          lastName={"Doe"}
          dateOfBirth={"2000-02-11"}
          idNumber={"99933223332"}
          gender={"Male"}
          yearsOfExperience={5}
          email={"jdo@emai.com"}
          contactNumber={"0721453234"}
          userId={"2"}
          onProfilePictureUpload={handleProfilePictureUpload}
        />
        <ResidentialAddressReviewCard
          farmName="ZFarming"
          village={"Vilakazi"}
          region={"South"}
          userId={"23"}
        />

        <KycDocumentsCard onDocumentsUpdate={handleKycDocumentsUpdate} />

        {hasKycDocuments && <KycSubmitDocuments />}

        <div className="flex w-[630px] flex-col items-center justify-center gap-2 rounded-[24px]">
          {!isComplete && missingRequirements.length > 0 && (
            <div className="flex w-[630px] items-center justify-start gap-4 rounded-md bg-[#D5E6FD] p-3 px-6">
              <Info size={50} color="#00439E" className="shrink-0" />
              <div>
                <ol className="text-[#00439E]">
                  {missingRequirements.map((requirement, index) => (
                    <li key={index}>
                      {index + 1}. {requirement}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
          <Button
            className="h-[56px] w-[400px] bg-[#22C55E] hover:bg-[#22C55E]/90"
            disabled={!isComplete}
            onClick={handleConfirmAndContinue}
          >
            Confirm and continue
          </Button>
        </div>
      </div>
    </div>
  );
}
