export const SummaryCard = ({
  title,
  value,
  unit,
  subtitle,
  bgColor = "bg-blue-100",
  textColor = "text-blue-600",
  valueColor = "text-blue-700",
  className = "",
}: {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  valueColor?: string;
  className?: string;
}) => {
  return (
    <div className={`${bgColor} rounded-xl p-6 ${className}`}>
      <div className={`${textColor} mb-2 text-sm font-medium`}>{title}</div>
      <div
        className={`${valueColor} mb-1 whitespace-nowrap text-2xl font-semibold`}
      >
        {value}
      </div>
      <div className={`${textColor} text-xs font-thin`}>{unit || subtitle}</div>
    </div>
  );
};
