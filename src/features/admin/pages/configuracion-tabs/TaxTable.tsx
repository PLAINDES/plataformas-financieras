import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { useClientPagination } from "@/features/admin/hooks/useClientPagination";

interface TaxTableProps {
  data: any[];
  isLoading: boolean;
  onDelete: (item: any) => void;
}

export const TaxTable = ({ data, isLoading, onDelete }: TaxTableProps) => {
  const { paginatedData, tableProps } = useClientPagination(data);

  return (
    <SimpleTable
      isLoading={isLoading}
      data={paginatedData}
      {...tableProps}
      columns={[
        {
          header: "Global Default Spread",
          accessorKey: "global_default_spread",
          cell: (item) => (
            <span className="font-medium">{item.global_default_spread}</span>
          ),
        },
        {
          header: "Tax Rate",
          accessorKey: "tax_rate",
          cell: (item) => <span className="font-medium">{item.tax_rate}</span>,
        },
      ]}
      onDelete={onDelete}
    />
  );
};
