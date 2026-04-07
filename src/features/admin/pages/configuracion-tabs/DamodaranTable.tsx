import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { formatPercentageValue } from "@/lib/formatPercentageValue";

interface DamodaranTableProps {
  data: any[];
  isLoading: boolean;
  onDelete: (item: any) => void;
}

export const DamodaranTable = ({
  data,
  isLoading,
  onDelete,
}: DamodaranTableProps) => {
  const yearFilterOptions = Array.from(
    new Set(
      data
        .map((item) => String(item.fecha ?? "").trim())
        .filter((year) => /^\d{4}$/.test(year))
    )
  ).sort((a, b) => Number(a) + Number(b));

  return (
    <SimpleTable
      isLoading={isLoading}
      data={data}
      yearFilterOptions={yearFilterOptions}
      columns={[
        {
          header: "Industria",
          accessorKey: "industria",
          cell: (item) => (
            <span className="font-medium text-gray-900">{item.industria}</span>
          ),
        },
        {
          header: "D/(D+E)",
          accessorKey: "d_sobre_def",
          cell: (item) => (
            <span>{formatPercentageValue(item.d_sobre_def)}</span>
          ),
        },
        {
          header: "E/(D+E)",
          accessorKey: "e_sobre_de",
          cell: (item) => <span>{formatPercentageValue(item.e_sobre_de)}</span>,
        },
        {
          header: "Tax Rate",
          accessorKey: "tax_rate",
          cell: (item) => <span>{formatPercentageValue(item.tax_rate)}</span>,
        },
        {
          header: "Beta",
          accessorKey: "beta",
          cell: (item) => <span>{formatPercentageValue(item.beta)}</span>,
        },
        {
          header: "Std Dev in Stock",
          accessorKey: "std_dev_stock",
          cell: (item) => (
            <span>{formatPercentageValue(item.std_dev_stock)}</span>
          ),
        },
        {
          header: "Spread Debt",
          accessorKey: "spread_debt",
          cell: (item) => (
            <span>{formatPercentageValue(item.spread_debt)}</span>
          ),
        },
      ]}
      onDelete={onDelete}
    />
  );
};
