import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { useClientPagination } from "@/features/admin/hooks/useClientPagination";

interface DevaluacionTableProps {
  data: any[];
  isLoading: boolean;
  onDelete: (item: any) => void;
}

// Función auxiliar para renderizar los porcentajes correctamente
const formatPercentage = (value: any) => {
  // Validamos si no hay dato
  if ([undefined, null, 0, ""].includes(value)) return <span>-</span>;

  return <span>{(parseFloat(value) * 100).toFixed(2)}%</span>;
};

export const DevaluacionTable = ({
  data,
  isLoading,
  onDelete,
}: DevaluacionTableProps) => {
  const { paginatedData, tableProps } = useClientPagination(data);
  return (
    <SimpleTable
      isLoading={isLoading}
      data={paginatedData}
      {...tableProps}
      columns={[
        {
          header: "Periodo",
          accessorKey: "periodo",
          cell: (item) => {
            if ([undefined, null, ""].includes(item.periodo))
              return <span>-</span>;

            const val = parseFloat(item.periodo);
            return <span>{isNaN(val) ? item.periodo : val}</span>;
          },
        },
        {
          header: "Argentina",
          accessorKey: "Argentina",
          cell: (item) => formatPercentage(item["Argentina"]),
        },
        {
          header: "Brazil",
          accessorKey: "Brazil",
          cell: (item) => formatPercentage(item["Brazil"]),
        },
        {
          header: "Chile",
          accessorKey: "Chile",
          cell: (item) => formatPercentage(item["Chile"]),
        },
        {
          header: "Colombia",
          accessorKey: "Colombia",
          cell: (item) => formatPercentage(item["Colombia"]),
        },
        {
          header: "Ecuador",
          accessorKey: "Ecuador",
          cell: (item) => formatPercentage(item["Ecuador"]),
        },
        {
          header: "México",
          accessorKey: "Mexico",
          cell: (item) => formatPercentage(item["Mexico"]),
        },
        {
          header: "Perú",
          accessorKey: "Peru",
          cell: (item) => formatPercentage(item["Peru"]),
        },
      ]}
      onDelete={onDelete}
    />
  );
};
