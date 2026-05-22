// src/shared/hooks/useClientPagination.ts
import { useState, useMemo } from "react";

const extractYear = (
  dateString: string | number | undefined
): string | null => {
  if (!dateString) return null;
  const str = String(dateString).trim();

  // Si ya es un año de 4 dígitos ("2021")
  if (/^\d{4}$/.test(str)) return str;

  // Si es un formato DD/MM/YYYY o similar ("31/12/2024")
  const match = str.match(/\b(19|20)\d{2}\b/);
  if (match) return match[0];

  return null;
};

export function useClientPagination(data: any[], pageSize: number = 15) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");

  const yearFilterOptions = useMemo(() => {
    return Array.from(
      new Set(
        data
          .map((item) => extractYear(item.fecha))
          .filter((v): v is string => !!v)
      )
    ).sort((a, b) => Number(b) - Number(a));
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;

    if (selectedYear !== "ALL") {
      result = result.filter((item) => {
        const itemYear = extractYear(item.fecha);
        return itemYear === selectedYear;
      });
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(lowerQuery)
        )
      );
    }

    return result;
  }, [data, selectedYear, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = filteredData.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  return {
    paginatedData,
    tableProps: {
      totalItems: filteredData.length,
      totalPages,
      currentPage: safePage,
      onPageChange: setCurrentPage,
      searchQuery,
      onSearchChange: handleSearch,
      yearFilterOptions,
      selectedYear,
      onYearChange: handleYearChange,
    },
  };
}
