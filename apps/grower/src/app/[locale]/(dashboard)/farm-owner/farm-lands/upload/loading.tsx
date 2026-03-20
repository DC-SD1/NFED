import { FarmLandUploadLoading } from "@/components/dashboard/page-loading";
import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";

export default function Loading() {
  return (
    <TopLeftHeaderLayout>
      <FarmLandUploadLoading />
    </TopLeftHeaderLayout>
  );
}