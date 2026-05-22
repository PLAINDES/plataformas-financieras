import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { formatPercentageValue } from "@/lib/formatPercentageValue";
import { useClientPagination } from "@/features/admin/hooks/useClientPagination";

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
  const { paginatedData, tableProps } = useClientPagination(data, 15);

  return (
    <SimpleTable
      isLoading={isLoading}
      data={paginatedData}
      {...tableProps}
      columns={[
        {
          header: "Industria",
          accessorKey: "industria",
          cell: (item) => (
            <span className="font-medium text-gray-900">{item.industria}</span>
          ),
        },
        {
          header: "N° Firms",
          accessorKey: "number_of_firms",
          cell: (item) => <span>{item.number_of_firms}</span>,
        },
        {
          header: "Beta",
          accessorKey: "beta",
          cell: (item) => <span>{formatPercentageValue(item.beta)}</span>, // Puedes quitar formatPercentage si Beta no se muestra con %
        },
        {
          header: "Cost of Equity",
          accessorKey: "cost_of_equity",
          cell: (item) => (
            <span>{formatPercentageValue(item.cost_of_equity)}</span>
          ),
        },
        {
          header: "E/(D+E)",
          accessorKey: "e_sobre_de",
          cell: (item) => <span>{formatPercentageValue(item.e_sobre_de)}</span>,
        },
        {
          header: "Std Dev Stock",
          accessorKey: "std_dev_stock",
          cell: (item) => (
            <span>{formatPercentageValue(item.std_dev_stock)}</span>
          ),
        },
        {
          header: "Cost of Debt",
          accessorKey: "cost_of_debt",
          cell: (item) => (
            <span>{formatPercentageValue(item.cost_of_debt)}</span>
          ),
        },
        {
          header: "Tax Rate",
          accessorKey: "tax_rate",
          cell: (item) => <span>{formatPercentageValue(item.tax_rate)}</span>,
        },
        {
          header: "After-tax Debt",
          accessorKey: "after_tax_cost_of_debt",
          cell: (item) => (
            <span>{formatPercentageValue(item.after_tax_cost_of_debt)}</span>
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
          header: "Cost Capital",
          accessorKey: "cost_of_capital",
          cell: (item) => (
            <span>{formatPercentageValue(item.cost_of_capital)}</span>
          ),
        },
      ]}
      onDelete={onDelete}
    />
  );
};
