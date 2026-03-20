import { Badge } from "@cf/ui/components/badge";
import { Check, Info } from "lucide-react";
import { useTranslations } from "next-intl";

export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const t = useTranslations("auth.passwordRequirements");
  
  const passwordRequirements: PasswordRequirement[] = [
    {
      id: "length",
      label: t("characters"),
      test: (password) => password.length >= 8,
    },
    {
      id: "lowercase",
      label: t("lowercase"),
      test: (password) => /[a-z]/.test(password),
    },
    {
      id: "uppercase",
      label: t("uppercase"),
      test: (password) => /[A-Z]/.test(password),
    },
    {
      id: "special",
      label: t("special"),
      test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
    {
      id: "number",
      label: t("number"),
      test: (password) => /\d/.test(password),
    },
  ];

  const getRequirementStatus = (requirement: PasswordRequirement) => {
    return requirement.test(password);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Info className="text-foreground size-4" />
        <span>{t("atLeast")}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {passwordRequirements.map((requirement) => {
          const isValid = getRequirementStatus(requirement);
          return (
            <Badge
              key={requirement.id}
              variant="outline"
              className={`rounded-full border-2 border-dashed px-3 py-1 text-xs transition-all ${
                isValid
                  ? "border-primary bg-primary/10 text-primary"
                  : "bg-transparent text-gray-600"
              }`}
            >
              {isValid && <Check className="mr-1 size-3" />}
              {requirement.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
