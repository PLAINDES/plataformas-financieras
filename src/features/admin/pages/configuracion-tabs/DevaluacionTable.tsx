import React from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";

interface DevaluacionTableProps {
  data: any[];
  isLoading: boolean;
  onDelete: (item: any) => void;
}

export const DevaluacionTable = ({
  data,
  isLoading,
  onDelete,
}: DevaluacionTableProps) => {
  return (
    <SimpleTable
      isLoading={isLoading}
      data={data}
      columns={[
        {
          header: "Periodo",
          accessorKey: "periodo",
          cell: (item) => {
            if ([undefined, null, ""].includes(item.periodo))
              return <span>-</span>;
            const val = parseFloat(item.periodo);
            return <span>{isNaN(val) ? item.periodo : val.toFixed(4)}</span>;
          },
        },
        {
          header: "Argentina",
          accessorKey: "Argentina",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Argentina"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Argentina"]).toFixed(4)}%</span>;
          },
        },
        {
          header: "Brazil",
          accessorKey: "Brazil",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Brazil"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Brazil"]).toFixed(4)}%</span>;
          },
        },
        {
          header: "Chile",
          accessorKey: "Chile",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Chile"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Chile"]).toFixed(4)}%</span>;
          },
        },
        {
          header: "Colombia",
          accessorKey: "Colombia",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Colombia"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Colombia"]).toFixed(4)}%</span>;
          },
        },
        {
          header: "Ecuador",
          accessorKey: "Ecuador",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Ecuador"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Ecuador"]).toFixed(4)}%</span>;
          },
        },
        {
          header: "México",
          accessorKey: "Mexico",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Mexico"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Mexico"]).toFixed(4)}%</span>;
          },
        },
        {
          header: "Perú",
          accessorKey: "Peru",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Peru"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Peru"]).toFixed(4)}%</span>;
          },
        },
        {
          header: "United States",
          accessorKey: "United States",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["United States"]))
              return <span>-</span>;
            return <span>{parseFloat(item["United States"]).toFixed(4)}%</span>;
          },
        },
      ]}
      onDelete={onDelete}
      yearFilterOptions={Array.from(
        new Set(data.map((item) => String(item.fecha)))
      ).sort((a, b) => b.localeCompare(a))}
      yearFilterField="fecha"
    />
  );
};
