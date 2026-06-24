import { useState, useMemo } from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { useClientPagination } from "@/features/admin/hooks/useClientPagination";
import { INDUSTRY_TRANSLATIONS } from "@/shared/constants/kapital";

interface SubsectoresTableProps {
  data: any[];
  isLoading: boolean;
  onDelete: (item: any) => void;
}

const translateSector = (sector: string): string =>
  INDUSTRY_TRANSLATIONS[sector] || sector;

export const SubsectoresTable = ({
  data,
  isLoading,
  onDelete,
}: SubsectoresTableProps) => {
  const [selectedSector, setSelectedSector] = useState("");

  const sectors = useMemo(() => {
    const unique = Array.from(
      new Set(data.map((d) => d.sector).filter(Boolean))
    );
    return unique.sort((a, b) =>
      translateSector(a).localeCompare(translateSector(b))
    );
  }, [data]);

  const filteredData = useMemo(() => {
    if (!selectedSector) return data;
    return data.filter((d) => d.sector === selectedSector);
  }, [data, selectedSector]);

  const { paginatedData, tableProps } = useClientPagination(filteredData);

  return (
    <SimpleTable
      isLoading={isLoading}
      data={paginatedData}
      {...tableProps}
      columns={[
        {
          header: "Sector",
          accessorKey: "sector",
          cell: (item) => <span>{translateSector(item.sector)}</span>,
        },
        { header: "Subsector", accessorKey: "subsector" },
        {
          header: "Empresas",
          accessorKey: "empresas",
          cell: (item) => (
            <div className="flex flex-wrap gap-1">
              {Array.isArray(item.empresas) && item.empresas.length > 0
                ? item.empresas.map((emp: string, i: number) => {
                    const boa = item.empresas_boa?.[emp];
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
                      >
                        {emp}
                        {boa !== undefined && (
                          <span className="text-blue-400 font-mono">
                            {boa.toFixed(4)}
                          </span>
                        )}
                      </span>
                    );
                  })
                : <span className="text-gray-400">-</span>}
            </div>
          ),
        },
      ]}
      onDelete={onDelete}
    >
      <select
        value={selectedSector}
        onChange={(e) => setSelectedSector(e.target.value)}
        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">Todos los sectores</option>
        {sectors.map((sector) => (
          <option key={sector} value={sector}>
            {translateSector(sector)}
          </option>
        ))}
      </select>
    </SimpleTable>
  );
};
