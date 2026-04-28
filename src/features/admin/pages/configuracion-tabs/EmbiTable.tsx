import { SimpleTable } from "@/shared/components/ui/SimpleTable";

interface EmbiTableProps {
  data: any[];
  isLoading: boolean;
  onDelete: (item: any) => void;
}

export const EmbiTable = ({ data, isLoading, onDelete }: EmbiTableProps) => {
  return (
    <SimpleTable
      isLoading={isLoading}
      data={data}
      columns={[
        { header: "Fecha", accessorKey: "fecha" },
        {
          header: "Argentina",
          accessorKey: "Argentina",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Argentina"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Argentina"]).toFixed(2)}</span>;
          },
        },
        {
          header: "Brazil",
          accessorKey: "Brazil",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Brazil"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Brazil"]).toFixed(2)}</span>;
          },
        },
        {
          header: "Chile",
          accessorKey: "Chile",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Chile"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Chile"]).toFixed(2)}</span>;
          },
        },
        {
          header: "Colombia",
          accessorKey: "Colombia",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Colombia"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Colombia"]).toFixed(2)}</span>;
          },
        },
        {
          header: "Ecuador",
          accessorKey: "Ecuador",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Ecuador"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Ecuador"]).toFixed(2)}</span>;
          },
        },
        {
          header: "México",
          accessorKey: "Mexico",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Mexico"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Mexico"]).toFixed(2)}</span>;
          },
        },
        {
          header: "Perú",
          accessorKey: "Peru",
          cell: (item) => {
            if ([undefined, 0, ""].includes(item["Peru"]))
              return <span>-</span>;
            return <span>{parseFloat(item["Peru"]).toFixed(2)}</span>;
          },
        },
      ]}
      onDelete={onDelete}
    />
  );
};
