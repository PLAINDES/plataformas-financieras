import React, { useState } from "react";
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
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onRowClick?: (item: T) => void;

  yearFilterOptions?: Array<string | number>;
  selectedYear?: string;
  onYearChange?: (year: string) => void;
}

export function SimpleTable<T extends object>({
  data,
  columns,
  onDelete,
  onEdit,
  onCreate,
  isLoading,
  yearFilterOptions,
  onYearChange,
  selectedYear,
  onRowClick,
  totalItems = 0,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  searchQuery = "",
  onSearchChange,
}: SimpleTableProps<T>) {
  const [pageInputValue, setPageInputValue] = useState(String(currentPage));

  // Sincronizar el input si la página cambia externamente (ej. botones Anterior/Siguiente)
  React.useEffect(() => {
    setPageInputValue(String(currentPage));
  }, [currentPage]);

  const handlePageJump = () => {
    if (!onPageChange) return;
    const pageNumber = parseInt(pageInputValue, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    } else {
      // Si pone un número inválido, regresamos el input al valor de la página actual
      setPageInputValue(String(currentPage));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 flex flex-col">
      <header className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3 sm:items-start">
        {onSearchChange && (
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar por código..."
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        )}
        {onCreate && (
          <div className="ml-auto">
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Crear
            </button>
          </div>
        )}
        {yearFilterOptions && yearFilterOptions.length > 0 && onYearChange && (
          <div className="w-full h-full flex items-center justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <button
                key="ALL"
                type="button"
                onClick={() => onYearChange("ALL")}
                className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                  selectedYear === "ALL" || !selectedYear
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Todos
              </button>
              {yearFilterOptions.map((rawYear) => {
                const yearAsString = String(rawYear);
                const isSelected = selectedYear === yearAsString;

                return (
                  <button
                    key={yearAsString}
                    type="button"
                    onClick={() => onYearChange(yearAsString)}
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
      </header>

      <div className="w-full overflow-x-auto">
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
            ) : data.length === 0 ? (
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
              data.map((item, itemIndex) => (
                <tr
                  key={`${String((item as any).id ?? "no-id")}-${String((item as any).fecha ?? "no-fecha")}-${itemIndex}`}
                  onClick={() => onRowClick?.(item)}
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
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
      {totalPages > 1 && onPageChange && !isLoading && (
        <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white gap-4">
          <div className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
            Mostrando resultados de un total de{" "}
            <span className="font-medium">{totalItems}</span>
          </div>
          <div className="flex flex-col sm:flex-row flex-1 items-center justify-end gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-700 mx-auto">
                Ir a la página:
              </span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageInputValue}
                onChange={(e) => setPageInputValue(e.target.value)}
                onBlur={handlePageJump}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePageJump();
                  }
                }}
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                title="Escribe un número y presiona Enter"
              />
              <span className="text-sm text-gray-700">de {totalPages}</span>
            </div>

            {/* Botones Anterior / Siguiente */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="cursor-pointer relative inline-flex items-center px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Anterior
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="cursor-pointer relative inline-flex items-center px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
