import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { formatPercentageValue } from "@/lib/formatPercentageValue";

interface PrimaTableProps {
  data: any[];
  isLoading: boolean;
  onDelete: (item: any) => void;
}

export const PrimaTable = ({ data, isLoading, onDelete }: PrimaTableProps) => {
  return (
    <SimpleTable
      isLoading={isLoading}
      data={data}
      columns={[
        {
          header: "Año",
          accessorKey: "fecha",
          cell: (item) => (
            <span className="font-mono text-gray-900">{item.fecha}</span>
          ),
        },
        {
          header: "PRM (T-bonds) actual",
          accessorKey: "PRM (T-bonds) actual",
          cell: (item) => (
            <span>{formatPercentageValue(item["PRM (T-bonds) actual"])}</span>
          ),
        },
        {
          header: "Rm",
          accessorKey: "Rm",
          cell: (item) => <span>{formatPercentageValue(item["Rm"])}</span>,
        },
        {
          header: "Rf (t-bonds)",
          accessorKey: "Rf (t-bonds)",
          cell: (item) => (
            <span>{formatPercentageValue(item["Rf (t-bonds)"])}</span>
          ),
        },
      ]}
      onDelete={onDelete}
    />
  );
};
