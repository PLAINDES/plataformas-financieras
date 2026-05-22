import { useMemo } from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { formatPercentageValue } from "@/lib/formatPercentageValue";
import { useClientPagination } from "@/features/admin/hooks/useClientPagination";
import { COUNTRIES } from "@/shared/constants/kapital";

interface IrTableProps {
  data: any[];
  isLoading: boolean;
  onDelete: (item: any) => void;
}

export const IrTable = ({ data, isLoading, onDelete }: IrTableProps) => {
  // Filtra los datos
  const filteredByCountryData = useMemo(() => {
    // Normaliza el arreglo de constantes (minúsculas y sin tildes)
    const allowedCountries = COUNTRIES.map((c) =>
      c
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    );

    return data.filter((item) => {
      // Normalizamos el valor proveniente de la base de datos
      const pais = String(item.pais || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      return allowedCountries.includes(pais);
    });
  }, [data]);

  const { paginatedData, tableProps } = useClientPagination(
    filteredByCountryData
  );

  const getIrColumns = () => {
    const baseCols: any[] = [{ header: "País", accessorKey: "pais" }];
    const years = new Set<string>();

    // Sigue usando 'data' para generar las columnas,
    // Esto garantiza que si una página no contiene un país con datos
    // en un año específico, la columna de ese año no desaparezca de la tabla.
    filteredByCountryData.forEach((item: any) => {
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
      data={paginatedData}
      columns={getIrColumns()}
      onDelete={onDelete}
      {...tableProps}
    />
  );
};
