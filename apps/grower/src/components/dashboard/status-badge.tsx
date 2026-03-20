export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "assigned":
        return "bg-primary-light text-primary";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "not assigned":
        return "bg-yellow-light text-yellow-dark";
      case "deactivated":
        return "bg-red-light text-red-dark";
      default:
        return "bg-gray-100  text-gray-800";
    }
  };

  return (
    <span
      className={` text-normal max-w-[120px] items-center whitespace-normal break-words rounded-full border border-none px-2.5 py-1 text-center font-medium ${getStatusStyles(status)}`}
    >
      {status}
    </span>
  );
};
