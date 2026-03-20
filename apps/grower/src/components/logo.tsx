import { Button } from "@cf/ui/components/button";
import { Label } from "@cf/ui/components/label";
import { ChevronLeft } from "@cf/ui/icons";
import Image from "next/image";

import lightLogo from "@/assets/images/header-logo-light.png";
import primaryLogo from "@/assets/images/header-logo-primary.png";

interface LogoProps {
  useAlternativeLogo?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export function Logo({
  useAlternativeLogo = false,
  showBackButton = false,
  onBackPress,
}: LogoProps) {
  const logoSrc = useAlternativeLogo ? lightLogo : primaryLogo;
  return (
    <div className="mb-12 flex flex-col gap-10 lg:hidden">
      <div className="flex-row items-center justify-center py-2">
        {showBackButton && (
          <Button
            onClick={onBackPress}
            className="absolute left-3 flex-row items-center"
            variant="ghost"
          >
            <ChevronLeft className="text-primary" width={20} height={20} />
            <Label className="text-foreground text-lg font-medium">Back</Label>
          </Button>
        )}
      </div>
      <div className="flex items-center justify-center">
        <Image
          src={logoSrc}
          alt="CF Grower Logo"
          width={140}
          height={28}
          priority
        />
      </div>
    </div>
  );
}
