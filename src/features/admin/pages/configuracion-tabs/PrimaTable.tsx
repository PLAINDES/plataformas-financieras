import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { formatPercentageValue } from "@/lib/formatPercentageValue";
import { useClientPagination } from "@/features/admin/hooks/useClientPagination";

interface PrimaTableProps {
  data: any[];
  isLoading: boolean;
  onDelete: (item: any) => void;
}

export const PrimaTable = ({ data, isLoading, onDelete }: PrimaTableProps) => {
  const { paginatedData, tableProps } = useClientPagination(data);
  return (
    <SimpleTable
      isLoading={isLoading}
      data={paginatedData}
      {...tableProps}
      columns={[
        {
          header: "Año",
          accessorKey: "fecha",
          cell: (item) => (
            <span className="font-mono text-gray-900">{item.fecha}</span>
          ),
        },
        {
          header: "PRM Kroll",
          accessorKey: "PRM Kroll",
          cell: (item) => (
            <span>{formatPercentageValue(item["PRM Kroll"])}</span>
          ),
        },
      ]}
      onDelete={onDelete}
    />
  );
};
