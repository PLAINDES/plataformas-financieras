import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { ValoraEstadosSection } from "./ValoraEstadosSection";
import { ValoraGeneralResultsBlock } from "./ValoraGeneralResultsBlock";
import { ValoraComparisonResultsBlock } from "./ValoraComparisonResultsBlock";
import { ValoraSensibilidadResultsBlock } from "./ValoraSensibilidadResultsBlock";
import type {
  FinancialTable,
  FormData,
  ValoraCalculationResults,
} from "@/shared/types/ValoraTypes";

export type ValoraResultsSectionKey = "estados" | "resultados";
export type ValoraResultsView = "original" | "sensibilidad" | "comparacion";

const RESULT_TABS = [
  { id: "original" as const, label: "Original" },
  { id: "sensibilidad" as const, label: "Sensibilidad" },
  { id: "comparacion" as const, label: "Comparación" },
];

export interface ValoraResultsProps {
  formData: FormData;
  section: ValoraResultsSectionKey;
  balanceTable: FinancialTable | null;
  resultsTable: FinancialTable | null;
  calculationResults?: ValoraCalculationResults;
  sensitizedResults?: ValoraCalculationResults;
  resultView: ValoraResultsView;
  hasSensitized?: boolean;
  onResultViewChange: (view: ValoraResultsView) => void;
  onSectionChange?: (section: ValoraResultsSectionKey) => void;
  onOpenFormPanel?: () => void;
}

export const ValoraResults: React.FC<ValoraResultsProps> = ({
  formData,
  section,
  balanceTable,
  resultsTable,
  calculationResults,
  sensitizedResults,
  resultView,
  hasSensitized = false,
  onResultViewChange,
  onOpenFormPanel,
}) => {
  const [financialTab, setFinancialTab] = useState<"balance" | "results">(
    "balance"
  );

  const showTabs = hasSensitized;
  const controls = showTabs ? (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
      {onOpenFormPanel && (
        <button
          type="button"
          onClick={onOpenFormPanel}
          className="px-4 py-2 flex items-center justify-between gap-3 text-left font-semibold transition-all shadow-md w-full sm:w-auto cursor-pointer bg-valora-primary text-white rounded-xl hover:bg-valora-secondary max-w-100"
        >
          <span className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold leading-snug">
            <Sparkles className="h-5 w-5 shrink-0" />
            <span>Sensibiliza tus parámetros</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" />
        </button>
      )}
      <div className="flex gap-1 bg-slate-200/70 p-1 rounded-xl shadow-inner border border-slate-200 w-full sm:w-auto">
        {RESULT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onResultViewChange(tab.id)}
            className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap flex-1 sm:flex-none ${
              resultView === tab.id
                ? "bg-white text-valora-primary shadow-sm"
                : "text-slate-500 hover:text-valora-primary hover:bg-slate-100"
            } cursor-pointer`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className="flex flex-12 flex-col w-full h-full lg:pb-10 py-10 lg:pt-10 bg-[#f3f6f9]">
      <div className="flex-1 w-full px-4 sm:px-8">
        <div className="mx-auto flex w-full max-w-300 flex-col gap-6">
          {section === "resultados" && resultView === "original" && (
            <ValoraGeneralResultsBlock
              onOpenFormPanel={onOpenFormPanel}
              showPromptButton={!showTabs}
              results={calculationResults}
              toolbar={controls}
            />
          )}

          {section === "resultados" && resultView === "sensibilidad" && (
            <ValoraSensibilidadResultsBlock
              onOpenFormPanel={onOpenFormPanel}
              sector={formData.sector}
              originalResults={calculationResults}
              results={sensitizedResults}
              toolbar={controls}
            />
          )}

          {section === "resultados" && resultView === "comparacion" && (
            <ValoraComparisonResultsBlock
              toolbar={controls}
              baseResults={calculationResults}
              sensitizedResults={sensitizedResults}
            />
          )}

          {section === "estados" && (
            <ValoraEstadosSection
              financialTab={financialTab}
              onTabChange={setFinancialTab}
              renderTable={(table) => (
                <div className="overflow-x-auto rounded border border-gray-200 bg-white">
                  {!table ? (
                    <div className="p-4 text-sm text-gray-600">
                      Carga el archivo para ver la tabla.
                    </div>
                  ) : (
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
                            <td className="px-4 py-2 text-left border border-gray-100 text-gray-700">
                              {row.label}
                            </td>
                            {row.values.map((value, valueIndex) => (
                              <td
                                key={`${row.label}-${rowIndex}-${valueIndex}`}
                                className="px-4 py-2 text-right text-gray-700 border border-gray-100"
                              >
                                {value === null || value === undefined || value === ""
                                  ? "-"
                                  : typeof value === "number"
                                    ? value.toLocaleString("es-PE")
                                    : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
              balanceTable={balanceTable}
              resultsTable={resultsTable}
            />
          )}
        </div>
      </div>
    </div>
  );
};
