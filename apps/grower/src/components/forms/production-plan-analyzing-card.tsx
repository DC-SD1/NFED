import { memo } from "react";

interface AnalyzingCardProps {
  message: string;
}

export const AnalyzingCard = memo(({ message }: AnalyzingCardProps) => (
  <div className="border-blue-dark bg-blue-light mb-6 rounded-2xl border p-4">
    <div className="flex items-center space-x-3">
      <div className="flex size-6 items-center justify-center">
        <div className="border-blue-dark size-4 animate-spin rounded-full border-2 border-t-white" />
      </div>
      <span className="text-blue-semi font-thin">{message}</span>
    </div>
  </div>
));

AnalyzingCard.displayName = "AnalyzingCard";
