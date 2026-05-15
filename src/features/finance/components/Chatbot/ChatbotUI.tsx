import React from "react";
import { type CompanyData, type YahooFinanceData } from "./chatbot.interfaces";
import { useState, useEffect } from "react";
import { ConfirmationModal } from "@/shared/components/common/ConfirmationModal";
import { MousePointerClick, Trash2 } from "lucide-react";

export const TypingDots: React.FC = () => (
  <div className="flex items-center gap-2 mt-2 px-1">
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-sky-400"
          style={{ animation: `typingBounce 1.4s ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
    <span className="text-xs text-slate-400">
      Analizando datos financieros...
    </span>
  </div>
);

interface CompanyCardProps {
  company: CompanyData;
  onApply: (company: CompanyData) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onApply,
}) => {
  const dcPct =
    company.dc_ratio != null ? (company.dc_ratio * 100).toFixed(1) : "N/A";
  const taxPct =
    company.effective_tax_rate != null
      ? (company.effective_tax_rate * 100).toFixed(1)
      : "N/A";

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-3 cursor-pointer hover:border-sky-400"
      onClick={() => onApply(company)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-700 leading-tight">
          {company.company_name}
        </span>
        <span className="text-[10px] font-bold bg-sky-500 text-white px-1.5 py-0.5 rounded">
          {company.ticker}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mb-2">
        {company.country} | {company.sector}
      </p>
      <div className="border-t border-slate-100 pt-2 space-y-1">
        {[
          ["D/C Ratio", `${dcPct}%`],
          ["Tasa Impositiva", `${taxPct}%`],
          ["Beta Apalancado", company.beta_levered ?? "N/A"],
        ].map(([label, val]) => (
          <div
            key={label as string}
            className="flex justify-between text-[10px]"
          >
            <span className="text-slate-500 font-medium">{label}</span>
            <span className="text-sky-500 font-semibold">{val as string}</span>
          </div>
        ))}
        <div className="flex justify-between text-[10px] bg-linear-to-r from-sky-50 to-slate-50 rounded px-1.5 py-1 mt-1">
          <span className="text-slate-600 font-semibold">
            Beta Desapalancado
          </span>
          <span className="text-sky-600 font-bold">
            {company.beta_unlevered ?? "N/A"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center mt-2 border-t border-slate-100 pt-1.5 text-[10px] text-sky-400 font-medium gap-1">
        <MousePointerClick className="w-3 h-3" />
        Haz clic para usar estos datos
      </div>
    </div>
  );
};

interface BetaUpdateCardProps {
  response: string;
  newBeta: number;
  onUpdate: (beta: number) => void;
}

export const BetaUpdateCard: React.FC<BetaUpdateCardProps> = ({
  response,
  newBeta,
  onUpdate,
}) => (
  <div className="space-y-3">
    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
      {response}
    </p>
    <div className="rounded-xl border-l-4 border-sky-400 bg-linear-to-r from-sky-50 to-slate-50 p-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-lg font-bold text-sky-500">
          Nuevo Beta Sugerido: {newBeta}
        </p>
        <p className="text-[10px] text-slate-400">
          Basado en empresas comparables del sector
        </p>
      </div>
      <button
        onClick={() => onUpdate(newBeta)}
        className="shrink-0 text-xs font-semibold text-white bg-linear-to-r from-sky-400 to-blue-600 px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        Actualizar Beta
      </button>
    </div>
  </div>
);

interface YahooResultsProps {
  data: YahooFinanceData;
  onApply: (company: CompanyData) => void;
  isWaccCalculated: boolean;
  onRemove: (ticker: string) => void;
}

export const YahooResults: React.FC<YahooResultsProps> = ({
  data,
  onApply,
  isWaccCalculated,
  onRemove,
}) => {
  const [companies, setCompanies] = useState<CompanyData[]>(
    data.valid_companies || []
  );
  const [tickerToDelete, setTickerToDelete] = useState<string | null>(null);

  // Sincronizar si llegan nuevos datos del backend
  useEffect(() => {
    setCompanies(data.valid_companies || []);
  }, [data.valid_companies]);

  const confirmDelete = () => {
    if (tickerToDelete) {
      if (onRemove) {
        onRemove(tickerToDelete);
      } else {
        setCompanies((prev) => prev.filter((c) => c.ticker !== tickerToDelete));
      }
      setTickerToDelete(null);
    }
  };

  // Recalcular el BOA Promedio basado
  const validBetas = companies
    .map((c) => c.beta_unlevered)
    .filter((b) => b != null) as number[];

  const avgBetaUnlevered =
    validBetas.length > 0
      ? validBetas.reduce((sum, b) => sum + b, 0) / validBetas.length
      : undefined;

  // Vista de respaldo si borra absolutamente todas las filas
  if (companies.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-10 bg-gray-50 border border-gray-200 rounded-xl border-dashed">
        <Trash2 className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium text-center">
          Todas las empresas han sido eliminadas.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 justify-between">
      {/*   Tabla con Scroll y Cabecera Fija */}
      <div className="flex-1 h-full border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-0">
        <div className="overflow-y-auto w-full h-full">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left relative">
            <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0 z-30">
              <tr>
                <th className="px-2 py-1.5 sm:px-4 sm:py-3 bg-gray-50">
                  Ticker
                </th>
                <th className="px-2 py-1.5 sm:px-4 sm:py-3 bg-gray-50">
                  Empresa
                </th>
                <th className="px-2 py-1.5 sm:px-4 sm:py-3 bg-gray-50">
                  BOA<span className="hidden sm:inline"> (Desapalancado)</span>
                </th>
                <th className="px-2 py-1.5 sm:px-4 sm:py-3 bg-gray-50 text-center">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.valid_companies.map((company, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                  <td className="text-xs sm:text-sm px-2 py-1.5 sm:px-4 sm:py-3 font-medium text-blue-600">
                    {company.ticker}
                  </td>
                  <td className="text-xs sm:text-sm px-2 py-1.5 sm:px-4 sm:py-3 text-gray-700">
                    {company.company_name}
                  </td>
                  <td className="text-sm  px-2 py-1.5 sm:px-4 sm:py-3 font-bold text-gray-800">
                    {company.beta_unlevered?.toFixed(4) || "N/A"}
                  </td>
                  <td className="px-2 py-1.5 sm:px-4 sm:py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onApply(company)}
                        disabled={!isWaccCalculated}
                        title={
                          !isWaccCalculated
                            ? "Debe calcular el WACC primero"
                            : "Insertar al formulario"
                        }
                        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold mx-auto ${
                          isWaccCalculated
                            ? "bg-valora-primary text-white hover:bg-valora-secondary cursor-pointer shadow-sm"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <MousePointerClick className="w-3.5 h-3.5" />
                        Insertar
                      </button>
                      <button
                        onClick={() => setTickerToDelete(company.ticker)}
                        title="Eliminar de la lista"
                        className="p-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer border border-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* BOA Promedio del Sector */}
      {avgBetaUnlevered !== undefined && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="max-[540px]-text[11px] text-xs font-bold text-blue-700 uppercase tracking-wide">
              BOA Promedio del Sector
            </span>
            <span className="text-lg sm:text-2xl font-black text-gray-900 leading-none mt-1">
              {avgBetaUnlevered.toFixed(4)}
            </span>
          </div>
          <button
            onClick={() => {
              onApply({
                ticker: "PROMEDIO",
                company_name: "Promedio del Sector",
                country: "-",
                sector: "-",
                dc_ratio: null,
                effective_tax_rate: null,
                beta_levered: null,
                beta_unlevered: avgBetaUnlevered,
              });
            }}
            disabled={!isWaccCalculated}
            title={
              !isWaccCalculated
                ? "Debe calcular el WACC primero"
                : "Insertar promedio al formulario"
            }
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              isWaccCalculated
                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-md active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <MousePointerClick className="w-6 h-6" />
            Insertar Promedio
          </button>
        </div>
      )}

      {!isWaccCalculated && (
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 text-center">
          Realiza el cálculo base de tu WACC en el panel izquierdo antes de
          insertar datos optimizados.
        </p>
      )}
      {/* Componente del Modal */}
      <ConfirmationModal
        isOpen={tickerToDelete !== null}
        onClose={() => setTickerToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar empresa"
        description={`¿Estás seguro de eliminar el ticker ${tickerToDelete} de la lista? El promedio se recalculará sin esta empresa.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
};
