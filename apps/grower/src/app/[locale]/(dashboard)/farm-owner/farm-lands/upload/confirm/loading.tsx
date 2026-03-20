import { FarmLandConfirmLoading } from "@/components/dashboard/page-loading";
import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";

export default function Loading() {
  return (
    <TopLeftHeaderLayout>
      <FarmLandConfirmLoading />
    </TopLeftHeaderLayout>
  );
}