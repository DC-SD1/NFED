import { cn } from "@cf/ui";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

export const FeatureCard = ({
  icon = <></>,
  title = "",
  subtitle = "",
  cropName = "",
  bgColor = "",
  available = true,
  errorMessage = "",
  onClick = () => {
    //
  },
}) => {
  const bgColorMap: Record<string, string> = {
    "primary-icon-light": "bg-primary-icon-light",
    "primary-icon-bright": "bg-primary-icon-bright",
  };
  const t = useTranslations("farmPlan.planSummary");

  return (
    <div
      onClick={available ? onClick : undefined}
      onKeyDown={(event) => {
        if (available && event.key === "Enter") {
          onClick();
        }
      }}
      className={cn(
        "relative rounded-xl border border-none bg-white p-5 shadow-sm transition-all hover:shadow-md",
        available ? "cursor-pointer hover:shadow-md" : "cursor-not-allowed",
      )}
      tabIndex={available ? 0 : -1}
      role="button"
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex-1">
          <div
            className={cn("flex flex-row gap-3", !available && "opacity-60")}
          >
            <div
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full",
                bgColor ? bgColorMap[bgColor] : "bg-primary-light",
              )}
            >
              {icon && <div className="text-primary">{icon}</div>}
            </div>
            <div className="flex w-full flex-row items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-base">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {subtitle}
                </p>
                <div className="mt-4 flex">
                  <div className="text-xs">
                    {t("crop")}{" "}
                    <span className="text-gray-dark font-thin">{cropName}</span>
                  </div>
                </div>
              </div>
              <div className="items-center self-end">
                <div
                  className={cn(
                    "text-primary ml-auto self-end transition-transform",
                    available ? "group-hover:translate-x-1" : "hidden",
                  )}
                >
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
          </div>

          {!available && (
            <div className="bg-red-light mt-4 rounded-xl p-1 opacity-100">
              <p className="text-destructive text-xs font-thin">
                {errorMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
