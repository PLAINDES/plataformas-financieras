import React from "react";
import { type CompanyData, type YahooFinanceData } from "./chatbot.interfaces";
import { useState, useEffect } from "react";
import { ConfirmationModal } from "@/shared/components/common/ConfirmationModal";
import {
  ArrowRight,
  MousePointerClick,
  RotateCcw,
  Sparkles,
  Trash2,
  Bot,
  X,
  ArrowUp,
} from "lucide-react";
import {
  handleNumberValidation,
  handleNumberKeyDown,
} from "@/shared/utils/inputValidators";
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
        type="button"
        onClick={() => onUpdate(newBeta)}
        className="shrink-0 text-xs font-semibold text-white bg-linear-to-r from-sky-400 to-blue-600 px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        Actualizar Beta
      </button>
    </div>
  </div>
);

export const ChatbotHeader = ({ onClear }: { onClear: () => void }) => (
  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
    <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-valora-primary text-white">
        <Bot className="h-3.5 w-3.5" />
      </div>
      <span className="text-[13px] font-bold text-gray-800">Betito WACC</span>
      <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]"></span>
    </div>
    <button
      type="button"
      onClick={onClear}
      className="my-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-green-600 transition-colors hover:bg-gray-200/80 shadow-sm border"
      title="Reiniciar conversación"
    >
      <RotateCcw className="w-4 h-4" />
    </button>
  </div>
);

export const ChatEmptyState = ({
  suggestions,
  onSuggestionClick,
}: {
  suggestions: string[];
  onSuggestionClick: (s: string) => void;
}) => (
  <div className="flex h-full flex-col items-center justify-center text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm border border-gray-200">
      <Bot className="h-8 w-8 text-valora-primary" />
    </div>
    <h3 className="text-[15px] font-bold text-gray-800">Hola, soy Betito</h3>
    <p className="mx-6 mt-2 mb-6 text-sm text-gray-500 leading-relaxed">
      Tu asistente experto en cálculo WACC y análisis sectorial. ¿En qué puedo
      ayudarte?
    </p>
    <div className="flex w-full flex-col gap-2.5">
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSuggestionClick(s)}
          className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-left text-xs font-medium text-gray-700 shadow-sm transition-all hover:border-valora-primary/50 hover:shadow-md"
        >
          {s}
        </button>
      ))}
    </div>
  </div>
);

export const ChatTypingIndicator = () => (
  <div className="flex max-w-[85%] gap-2.5 animate-in fade-in">
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm">
      <Bot className="h-3.5 w-3.5" />
    </div>
    <div className="flex items-center gap-1.5 rounded-4xl rounded-tl-sm border border-gray-100 bg-white px-4 py-3.5 shadow-sm">
      <span
        className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  </div>
);

// --- INPUT AREA ---
export const ChatInputArea = ({
  input,
  setInput,
  onSend,
  inputRef,
  loading,
  sendMessage,
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  inputRef: any;
  loading: boolean;
  sendMessage: () => void;
}) => (
  <div className="px-4 py-2">
    <div className="flex items-end gap-2 rounded-full border border-gray-400 bg-white p-1.5 pr-2 shadow-sm transition-all focus-within:border-valora-primary/80 focus-within:shadow-md">
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Escribe un mensaje..."
        rows={1}
        className="chat-scroll ml-2 flex-1 resize-none bg-transparent px-1 py-2.5 text-xs text-gray-800 outline-none placeholder:text-gray-400 mb-0.5 max-h-25"
      />
      <button
        type="button"
        onClick={sendMessage}
        disabled={!input.trim() || loading}
        className="mb-0.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-gray-500 transition-all hover:bg-gray-300 active:scale-95 disabled:opacity-50 disabled:hover:bg-gray-200 not-disabled:bg-valora-primary not-disabled:text-white not-disabled:hover:bg-valora-primary/90"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  </div>
);

// --- FOOTER FORM ---
export const ChatFooterForm = ({
  betaInput,
  setBetaInput,
  onCalculate,
  loading,
}: {
  betaInput: string;
  setBetaInput: (v: string) => void;
  onCalculate: () => void;
  loading: boolean;
}) => (
  <div className="px-3 py-2 bg-white flex items-end gap-3 shrink-0 border-t border-slate-300">
    <div className="flex flex-col gap-1.5 w-2/5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-left">
        BETA DESAPALANCADO:
      </label>
      <input
        type="number"
        placeholder="0.00"
        step="0.0001"
        value={betaInput}
        className="w-22 text-base px-3 py-2 font-semibold text-slate-800 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white border border-gray-300 rounded-lg"
        onKeyDown={(e) => handleNumberKeyDown(e, false)}
        onChange={(e) => {
          handleNumberValidation(
            e,
            { maxDecimals: 4, max: 3, min: 0 },
            (validEvent) => {
              setBetaInput(validEvent.target.value);
            }
          );
        }}
      />
    </div>
    <button
      type="button"
      disabled={!betaInput || loading}
      onClick={onCalculate}
      className="m-auto flex-1 rounded-lg bg-blue-600 p-3 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-blue-700 cursor-pointer h-fit"
    >
      Calcula y compara tu WACC
    </button>
  </div>
);

export const ChatbotToggler = ({
  isOpen,
  onClick,
}: {
  isOpen?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
    className={`px-4 py-2.5 flex items-center justify-between gap-3 text-left font-semibold transition-all shadow-md w-full sm:w-auto cursor-pointer ${
      isOpen
        ? "bg-gray-900 text-white rounded-t-xl rounded-b-none border border-b-0 border-gray-200"
        : "bg-valora-primary text-white rounded-xl hover:bg-valora-secondary"
    }`}
  >
    <span className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold leading-snug">
      <Sparkles className="h-5 w-5 shrink-0" />
      Encuentra el Beta específico de tu sector
    </span>
    {isOpen ? (
      <X className="h-5 w-5 shrink-0 opacity-80 hover:opacity-100" />
    ) : (
      <ArrowRight className="h-5 w-5 shrink-0" />
    )}
  </button>
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
                        type="button"
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
                        type="button"
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
            type="button"
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
