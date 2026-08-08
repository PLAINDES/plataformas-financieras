import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { useClientPagination } from "@/features/admin/hooks/useClientPagination";

export type BvlCotizacionItem = {
  empresa: string;
  id: string;
  numero_acciones: number | null;
  capitalizacion_bursatil: number | null;
  valor_por_accion: number | null;
};

interface BvlTableProps {
  data: BvlCotizacionItem[];
  isLoading: boolean;
  onDelete: (item: BvlCotizacionItem) => void;
}

export const BvlTable = ({ data, isLoading, onDelete }: BvlTableProps) => {
  const { paginatedData, tableProps } = useClientPagination(data);
  return (
    <SimpleTable
      isLoading={isLoading}
      data={paginatedData}
      onDelete={onDelete}
      {...tableProps}
      columns={[
        { header: "Empresa", accessorKey: "empresa" },
        { header: "ID", accessorKey: "id" },
        {
          header: "N. Acciones",
          accessorKey: "numero_acciones",
          cell: (item) => (
            <span className="tabular-nums">
              {item.numero_acciones?.toLocaleString("es-PE")}
            </span>
          ),
        },
        {
          header: "Capitalización Bursátil",
          accessorKey: "capitalizacion_bursatil",
          cell: (item) => (
            <span className="tabular-nums">
              {item.capitalizacion_bursatil?.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          ),
        },
        {
          header: "Valor por Acción",
          accessorKey: "valor_por_accion",
          cell: (item) => (
            <span className="tabular-nums">
              {item.valor_por_accion?.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          ),
        },
      ]}
    />
  );
};
