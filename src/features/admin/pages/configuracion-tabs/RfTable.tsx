import React from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { formatPercentageValue } from "@/lib/formatPercentageValue";
import type { RiskFreeRateItem } from "@/shared/types";

interface RfTableProps {
  data: any[];
  isLoading: boolean;
  onDelete: (item: any) => void;
}

export const RfTable = ({ data, isLoading, onDelete }: RfTableProps) => {
  return (
    <SimpleTable
      isLoading={isLoading}
      data={data}
      columns={[
        { header: "Fecha / Madurez", accessorKey: "fecha" },
        {
          header: "0.08",
          accessorKey: "0.08",
          cell: (item) => <span>{formatPercentageValue(item["0.08"])}</span>,
        },
        {
          header: "0.17",
          accessorKey: "0.17",
          cell: (item) => <span>{formatPercentageValue(item["0.17"])}</span>,
        },
        {
          header: "0.25",
          accessorKey: "0.25",
          cell: (item) => <span>{formatPercentageValue(item["0.25"])}</span>,
        },
        {
          header: "0.50",
          accessorKey: "0.50",
          cell: (item) => <span>{formatPercentageValue(item["0.50"])}</span>,
        },
        {
          header: "1.00",
          accessorKey: "1.00",
          cell: (item) => <span>{formatPercentageValue(item["1.00"])}</span>,
        },
        {
          header: "2.00",
          accessorKey: "2.00",
          cell: (item) => <span>{formatPercentageValue(item["2.00"])}</span>,
        },
        {
          header: "3.00",
          accessorKey: "3.00",
          cell: (item) => <span>{formatPercentageValue(item["3.00"])}</span>,
        },
        {
          header: "5.00",
          accessorKey: "5.00",
          cell: (item) => <span>{formatPercentageValue(item["5.00"])}</span>,
        },
        {
          header: "7.00",
          accessorKey: "7.00",
          cell: (item) => <span>{formatPercentageValue(item["7.00"])}</span>,
        },
        {
          header: "10.00",
          accessorKey: "10.00",
          cell: (item) => <span>{formatPercentageValue(item["10.00"])}</span>,
        },
        {
          header: "20.00",
          accessorKey: "20.00",
          cell: (item) => <span>{formatPercentageValue(item["20.00"])}</span>,
        },
        {
          header: "30.00",
          accessorKey: "30.00",
          cell: (item) => <span>{formatPercentageValue(item["30.00"])}</span>,
        },
      ]}
      onDelete={onDelete}
    />
  );
};
