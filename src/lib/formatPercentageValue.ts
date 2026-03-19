export const formatPercentageValue = (value: number | undefined): string => {
  if (value === undefined) return "N/A";
  return (value * 100).toFixed(2) + "%";
};
