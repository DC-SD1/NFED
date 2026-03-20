import Image from "next/image";

interface DashboardBannerProps {
  src: any;
  alt?: string;
  className?: string;
}

export function DashboardBanner({
  src,
  alt = "Dashboard Banner",
  className,
}: DashboardBannerProps) {
  return (
    <div className={className || "relative h-[240px] w-full"}>
      <Image
        src={src}
        alt={alt}
        className="size-full rounded-xl object-cover"
      />
    </div>
  );
}
