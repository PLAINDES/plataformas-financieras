import React, { useMemo, useState } from "react";
import { Pencil } from "lucide-react";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index?: number) => React.ReactNode;
}

interface SimpleTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onDelete?: (item: T) => void;
  onEdit?: (item: T) => void;
  onCreate?: () => void;
  isLoading?: boolean;
  yearFilterOptions?: Array<string | number>;
  yearFilterField?: keyof T | string;
}

export function SimpleTable<T extends object>({
  data,
  columns,
  onDelete,
  onEdit,
  onCreate,
  isLoading,
  yearFilterOptions,
  yearFilterField = "fecha",
}: SimpleTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const PAGE_SIZE = 15;

  const availableYears = useMemo(
    () => (yearFilterOptions ?? []).map((y) => String(y)),
    [yearFilterOptions]
  );

  const effectiveSelectedYear =
    selectedYear === "ALL" || availableYears.includes(selectedYear)
      ? selectedYear
      : "ALL";

  const getYearFromValue = (value: unknown): string | null => {
    if (value === undefined || value === null) return null;

    if (typeof value === "number") {
      const asString = String(Math.trunc(value));
      return /^\d{4}$/.test(asString) ? asString : null;
    }

    const raw = String(value).trim();
    if (!raw) return null;

    const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) return yearMatch[0];

    const asDate = new Date(raw);
    if (!Number.isNaN(asDate.getTime())) {
      return String(asDate.getFullYear());
    }

    return null;
  };

  const yearFilteredData = useMemo(() => {
    if (!yearFilterOptions || yearFilterOptions.length === 0) {
      return data;
    }

    if (effectiveSelectedYear === "ALL") {
      return data;
    }

    return data.filter((item) => {
      const fieldValue = item[yearFilterField as keyof T];
      const year = getYearFromValue(fieldValue);
      return year === effectiveSelectedYear;
    });
  }, [data, effectiveSelectedYear, yearFilterField, yearFilterOptions]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return yearFilteredData;
    const lowercasedQuery = searchQuery.toLowerCase();
    return yearFilteredData.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(lowercasedQuery)
      )
    );
  }, [yearFilteredData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  // Ajuste de la página actual si queda fuera de rango tras un filtrado o cambio en los datos
  const safePage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  const paginatedData = filteredData.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const selectYear = (year: string) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3 sm:items-start">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Buscar..."
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {onCreate && (
          <div className="ml-auto">
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Crear
            </button>
          </div>
        )}
        {yearFilterOptions && yearFilterOptions.length > 0 && (
          <div className="w-full h-full flex items-center justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <button
                key="ALL"
                type="button"
                onClick={() => selectYear("ALL")}
                className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                  effectiveSelectedYear === "ALL"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Todos
              </button>
              {yearFilterOptions.map((year) => {
                const yearAsString = String(year);
                const isSelected = effectiveSelectedYear === yearAsString;
                return (
                  <button
                    key={yearAsString}
                    type="button"
                    onClick={() => selectYear(yearAsString)}
                    className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {yearAsString}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
              {(onDelete || onEdit) && (
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (onDelete || onEdit ? 1 : 0)}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  <div className="flex justify-center items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Cargando datos...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onDelete || onEdit ? 1 : 0)}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  {searchQuery
                    ? "No se encontraron resultados para su búsqueda"
                    : "No hay datos disponibles"}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, itemIndex) => (
                <tr
                  key={`${String((item as any).id ?? "no-id")}-${String((item as any).fecha ?? "no-fecha")}-${itemIndex}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {col.cell
                        ? col.cell(item, itemIndex)
                        : (item[col.accessorKey as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                  {(onDelete || onEdit) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="cursor-pointer text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="cursor-pointer text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors"
                            title="Eliminar"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && !isLoading && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-700">
            Mostrando{" "}
            <span className="font-medium">
              {Math.min((safePage - 1) * PAGE_SIZE + 1, filteredData.length)}
            </span>{" "}
            a{" "}
            <span className="font-medium">
              {Math.min(safePage * PAGE_SIZE, filteredData.length)}
            </span>{" "}
            de <span className="font-medium">{filteredData.length}</span>{" "}
            resultados
          </div>
          <div className="flex-1 flex justify-end gap-2">
            <button
              onClick={handlePrevPage}
              disabled={safePage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Anterior
            </button>
            <button
              onClick={handleNextPage}
              disabled={safePage === totalPages}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
