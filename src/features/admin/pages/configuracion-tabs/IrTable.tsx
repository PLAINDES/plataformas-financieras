import React from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { formatPercentageValue } from "@/lib/formatPercentageValue";

interface IrTableProps {
  data: any[];
  isLoading: boolean;
  onDelete: (item: any) => void;
}

export const IrTable = ({ data, isLoading, onDelete }: IrTableProps) => {
  const getIrColumns = () => {
    const baseCols: any[] = [{ header: "País", accessorKey: "pais" }];
    const years = new Set<string>();
    data.forEach((item: any) => {
      Object.keys(item).forEach((k) => {
        if (!isNaN(Number(k)) && k.length === 4) {
          years.add(k);
        }
      });
    });

    const sortedYears = Array.from(years).sort((a, b) => Number(a) - Number(b));

    sortedYears.forEach((year) => {
      baseCols.push({
        header: year,
        accessorKey: year,
        cell: (item: any) => (
          <span>
            {item[year] !== undefined ? formatPercentageValue(item[year]) : "-"}
          </span>
        ),
      });
    });

    return baseCols;
  };

  return (
    <SimpleTable
      isLoading={isLoading}
      data={data}
      columns={getIrColumns()}
      onDelete={onDelete}
    />
  );
};
