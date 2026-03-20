import { format, isValid, parseISO } from "date-fns";
import { AlertCircle } from "lucide-react";
import React from "react";

export interface AnalysisResults {
  confidence: string;
  zone: string;
  recommendedDate: string;
  analysis: string[];
}

export interface ResultsCardProps {
  results: AnalysisResults;
  title?: string;
  variant?: "warning" | "success" | "info" | "error";
  className?: string;
}

const variantStyles = {
  warning: {
    container: "border-warning-orange-light bg-orange-50",
    icon: "text-warning-orange-light",
    text: "text-warning-orange-light",
    dot: "bg-warning-orange-light",
  },
  success: {
    container: "border-green-500 bg-green-50",
    icon: "text-green-500",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  info: {
    container: "border-blue-500 bg-blue-50",
    icon: "text-blue-500",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  error: {
    container: "border-red-500 bg-red-50",
    icon: "text-red-500",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

export const ResultsCard: React.FC<ResultsCardProps> = ({
  results,
  title = "Planting Recommendation",
  variant = "warning",
  className = "",
}) => {
  const styles = variantStyles[variant];

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, "dd/MM/yyyy");
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className={`mb-6 rounded-2xl border p-4 ${styles.container} ${className}`}
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className={`mt-0.5 size-5 shrink-0 ${styles.icon}`} />
        <div className="flex-1">
          <h3 className="mb-2 font-thin text-[#4C3600]">
            {title} ({results.confidence})
          </h3>
          <div className="space-y-1 text-sm">
            <div>
              <span className={`font-semibold ${styles.text}`}>Zone: </span>
              <span className={styles.text}>{results.zone}</span>
            </div>
            <div>
              <span className={`font-semibold ${styles.text}`}>
                Recommended date:{" "}
              </span>
              <span className={styles.text}>
                {formatDate(results.recommendedDate)}
              </span>
            </div>
            <div className="mt-3">
              <span className={`mb-2 block font-semibold ${styles.text}`}>
                Analysis:
              </span>
              <ul className={`space-y-1 ${styles.text}`}>
                {results.analysis?.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span
                      className={`mr-2 mt-1.5 size-1 shrink-0 rounded-full ${styles.dot}`}
                    ></span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsCard;
