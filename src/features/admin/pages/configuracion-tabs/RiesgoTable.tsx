import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { formatPercentageValue } from "@/lib/formatPercentageValue";
import { useClientPagination } from "@/features/admin/hooks/useClientPagination";

interface RiesgoTableProps {
  data: any[];
  isLoading: boolean;
  onDelete: (item: any) => void;
}

export const RiesgoTable = ({
  data,
  isLoading,
  onDelete,
}: RiesgoTableProps) => {
  const { paginatedData, tableProps } = useClientPagination(data);

  return (
    <SimpleTable
      isLoading={isLoading}
      data={paginatedData}
      {...tableProps}
      columns={[
        {
          header: "Desviación Mínima",
          accessorKey: "min_deviation",
          cell: (item) => (
            <span className="font-medium text-gray-900">
              {formatPercentageValue(item.min_deviation)}
            </span>
          ),
        },
        {
          header: "Desviación Máxima",
          accessorKey: "max_deviation",
          cell: (item) => (
            <span>
              {item.max_deviation === 0 || !item.max_deviation
                ? "En adelante"
                : formatPercentageValue(item.max_deviation)}
            </span>
          ),
        },
        {
          header: "Basis Spread",
          accessorKey: "basis_spread",
          cell: (item) => (
            <span className="font-semibold text-blue-600">
              {formatPercentageValue(item.basis_spread)}
            </span>
          ),
        },
      ]}
      onDelete={onDelete}
    />
  );
};
