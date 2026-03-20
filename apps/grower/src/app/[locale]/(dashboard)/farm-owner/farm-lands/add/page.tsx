"use client";

import { Card, CardContent } from "@cf/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import openFieldImage from "@/assets/images/farm-lands/open-field-image.png";
import uploadImage from "@/assets/images/farm-lands/upload.png";
import usersCircleImage from "@/assets/images/farm-lands/users-circle.png";
import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import { useModal } from "@/lib/stores/use-modal";

interface FarmLandOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  action: () => void;
  useBottomSheet?: boolean;
}

interface FarmLandCardProps {
  option: FarmLandOption;
}

function FarmLandCard({ option }: FarmLandCardProps) {
  return (
    <Card
      className="border-border bg-card hover:border-primary/50 cursor-pointer border shadow-[0px_4px_64px_0px_rgba(22,29,20,0.15)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0px_8px_80px_0px_rgba(22,29,20,0.2)] active:translate-y-0 active:shadow-[0px_2px_32px_0px_rgba(22,29,20,0.1)]"
      onClick={option.action}
    >
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex-1 pr-4">
          <h3 className="text-foreground mb-1 text-base font-semibold">
            {option.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-5">
            {option.description}
          </p>
        </div>
        <div className="shrink-0">
          <div
            className={`flex size-[72px] items-center justify-center rounded-xl ${option.iconBg}`}
          >
            {option.icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AddFarmLandsPage() {
  const t = useTranslations("FarmLands");
  const router = useRouter();
  const { onOpen } = useModal();

  const handleMapFarmLand = () => {
    onOpen("MobileAppPrompt");
  };

  const handleUploadCoordinates = () => {
    onOpen("UploadCoordinates");
  };

  const handleRequestAssistance = () => {
    router.push("/farm-lands/assistance");
  };

  const farmLandOptions: FarmLandOption[] = [
    {
      id: "map",
      title: t("mapFarmLand.title"),
      description: t("mapFarmLand.description"),
      icon: (
        <Image
          src={openFieldImage}
          alt="Map farm land"
          width={32}
          height={32}
          className="size-16"
        />
      ),
      iconBg: "bg-transparent",
      action: handleMapFarmLand,
      useBottomSheet: true,
    },
    {
      id: "upload",
      title: t("uploadCoordinates.title"),
      description: t("uploadCoordinates.description"),
      icon: (
        <Image
          src={uploadImage}
          alt="Upload coordinates"
          width={32}
          height={32}
          className="size-16"
        />
      ),
      iconBg: "bg-transparent",
      action: handleUploadCoordinates,
    },
    {
      id: "assistance",
      title: t("requestAssistance.title"),
      description: t("requestAssistance.description"),
      icon: (
        <Image
          src={usersCircleImage}
          alt="Request assistance"
          width={32}
          height={32}
          className="size-16"
        />
      ),
      iconBg: "bg-transparent",
      action: handleRequestAssistance,
    },
  ];

  return (
    <TopLeftHeaderLayout>
      {/*used to have min-h-[calc(100vh-200px)] */}
      <div className="flex flex-col items-center justify-center px-1 py-2 lg:px-4">
        <div className="w-full max-w-4xl space-y-8 md:max-w-6xl lg:max-w-2xl">
          {/* Header */}
          <div className="space-y-3 text-left lg:text-center">
            <h1 className="text-foreground text-3xl font-semibold leading-9">
              {t("title")}
            </h1>
            <p className="text-muted-foreground text-base">{t("subtitle")}</p>
          </div>

          {/* Action Cards */}
          <div className="space-y-4">
            {farmLandOptions.map((option) => (
              <FarmLandCard key={option.id} option={option} />
            ))}
          </div>
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
