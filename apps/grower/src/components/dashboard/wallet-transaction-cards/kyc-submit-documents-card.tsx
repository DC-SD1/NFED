"use client";

import { Button, Card, CardContent, CardHeader } from "@cf/ui";
import { ChevronRight } from "@cf/ui/icons";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const KycSubmitDocuments = () => {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  const handleSubmitKyc = () => {
    router.push(`/${locale}/transaction/kyc`);
  };

  return (
    <Card className="w-[630px] rounded-[24px] border-none bg-white p-6">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-semibold">KYC Documents</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <p className="text-sm text-gray-dark">
          Update your KYC and submit relevant documents for your account to be
          fully compliant
        </p>
        <Button
          onClick={handleSubmitKyc}
          variant="default"
          className="mt-4 rounded-lg bg-[#22C55E] hover:bg-[#22C55E]/90"
        >
          Submit KYC
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default KycSubmitDocuments;
