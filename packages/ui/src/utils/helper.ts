export const truncateFileName = (name: string, maxLength = 30) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + "...";
};
