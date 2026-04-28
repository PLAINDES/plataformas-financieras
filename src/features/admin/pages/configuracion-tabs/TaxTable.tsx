import { SimpleTable } from "@/shared/components/ui/SimpleTable";

interface TaxTableProps {
  data: any[];
  isLoading: boolean;
  onDelete: (item: any) => void;
}

export const TaxTable = ({ data, isLoading, onDelete }: TaxTableProps) => {
  const yearFilterOptions = Array.from(
    new Set(
      data
        .map((item) => String(item.fecha ?? "").trim())
        .filter((year) => /^\d{4}$/.test(year))
    )
  ).sort((a, b) => Number(b) - Number(a));

  return (
    <SimpleTable
      isLoading={isLoading}
      data={data}
      yearFilterOptions={yearFilterOptions}
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
