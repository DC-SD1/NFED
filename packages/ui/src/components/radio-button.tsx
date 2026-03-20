import { Check } from "lucide-react";

// Custom Radio Button Component
export const CustomRadioButton = ({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex size-6 items-center justify-center rounded-full border-2 transition-all duration-200
        ${isSelected ? "border-primary bg-primary" : "border-gray-semi-dark"}
      `}
    >
      {isSelected && <Check className="size-3 text-white" strokeWidth={3} />}
    </button>
  );
};
