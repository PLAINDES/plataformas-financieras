import React, { useState } from "react";
import { ValoraEstadosSection } from "./ValoraEstadosSection";
import { ValoraResultadosSection } from "./ValoraResultadosSection";
import { ValoraSensibilidadSection } from "./ValoraSensibilidadSection";
import type { FinancialTable, FormData } from "@/shared/types/ValoraTypes";

export type ValoraResultsSectionKey =
  | "estados"
  | "resultados"
  | "sensibilidad";

export interface ValoraResultsProps {
  formData: FormData;
  section: ValoraResultsSectionKey;
  balanceTable: FinancialTable | null;
  resultsTable: FinancialTable | null;
  onSectionChange?: (section: ValoraResultsSectionKey) => void;
}

export const ValoraResults: React.FC<ValoraResultsProps> = ({
  section,
  balanceTable,
  resultsTable,
  onSectionChange,
}) => {
  const [financialTab, setFinancialTab] = useState<"balance" | "results">(
    "balance"
  );
  const mainLabelsForFinancialTables = [
    "TOTAL ACTIVOS",
    "TOTAL PASIVOS",
    "TOTAL PASIVOS Y PATRIMONIO",
    "Utilidad Bruta",
    "Utilidad Operativa",
    "Utilidad antes de impuesto a la renta",
    "Utilidad neta",
  ];

  const formatCell = (value: string | number | null) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    if (typeof value === "number") {
      return value.toLocaleString("es-PE");
    }
    return String(value);
  };

  const renderTable = (table: FinancialTable | null) => {
    if (!table) {
      return (
        <div className="rounded border border-gray-200 bg-white p-4 text-sm text-gray-600">
          Carga el archivo para ver la tabla.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f5f8fa] text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-bold border border-gray-100">
                {table.title}
              </th>
              {table.years.map((year) => (
                <th
                  key={year}
                  className="px-4 py-3 text-right font-bold border border-gray-100"
                >
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="border-y border-gray-200">
            {table.rows.map((row, rowIndex) => (
              <tr key={`${row.label}-${rowIndex}`}>
                <td
                  className={`px-4 py-2 text-left border border-gray-100 ${mainLabelsForFinancialTables.includes(row.label) ? "font-bold bg-blue-600/10 text-blue-600" : "text-gray-700"}`}
                >
                  {row.label}
                </td>
                {row.values.map((value, valueIndex) => (
                  <td
                    key={`${row.label}-${rowIndex}-${valueIndex}`}
                    className="px-4 py-2 text-right text-gray-700 border border-gray-100"
                  >
                    {formatCell(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex-12 flex flex-col w-full h-full lg:pb-10 py-10 lg:pt-10 bg-[#f3f6f9] min-h-dvh">
      <div className="flex-1 w-full px-4 sm:px-8">
        <div className="mx-auto flex w-full max-w-300 flex-col gap-6">
          {section === "resultados" && (
            <ValoraResultadosSection
              onOpenSensibilidad={() => onSectionChange?.("sensibilidad")}
            />
          )}

          {section === "estados" && (
            <ValoraEstadosSection
              financialTab={financialTab}
              onTabChange={setFinancialTab}
              renderTable={renderTable}
              balanceTable={balanceTable}
              resultsTable={resultsTable}
            />
          )}

          {section === "sensibilidad" && <ValoraSensibilidadSection />}
        </div>
      </div>
    </div>
  );
};
