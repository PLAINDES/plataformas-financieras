// features/finance/kapital/components/KapitalAnalisisSection.tsx

import { useState } from "react";
import { FinancieraCard } from "./FinancieraCard";
import type { Results, SensibilizacionEntry } from "../KapitalPage";
import { File } from "lucide-react";

const BoaIndicator = ({ value }: { value: number | string }) => (
  <div className="w-1/4 flex justify-center items-center h-full m-auto px-4">
    <div className="flex items-baseline gap-4">
      <div className="flex items-baseline text-[#0088cc]">
        <span className="text-4xl lg:text-6xl font-serif">β</span>
        <span className="text-lg lg:text-xl font-bold">oa</span>
      </div>
      <span className="text-2xl lg:text-3xl font-normal text-gray-900">
        {value}
      </span>
    </div>
  </div>
);

export interface KapitalAnalisisSectionProps {
  results: Results;
  showCompanyCard: boolean;
  resultCurrency: "pen" | "usd";
  onResultCurrencyChange: (currency: "pen" | "usd") => void;
  analysisDC: string;
  analysisKd: string;
  analysisCurrency: string;
  onAnalysisDCChange: (value: string) => void;
  onAnalysisKdChange: (value: string) => void;
  onAnalysisCurrencyChange: (value: string) => void;
  onAnalysisSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  showComparison: boolean;
  onToggleComparison: (show: boolean) => void;
  sensibilizaciones: SensibilizacionEntry[];
  onOpenReport?: () => void;
}

export const KapitalAnalisisSection: React.FC<KapitalAnalisisSectionProps> = ({
  results,
  showCompanyCard,
  resultCurrency,
  onResultCurrencyChange,
  showComparison,
  onToggleComparison,
  sensibilizaciones,
  onOpenReport,
}) => {
  const [selectedSensIdx, setSelectedSensIdx] = useState(0);

  // 1. DATOS ORIGINALES
  const developedData = results.developed;
  const emergentOriginal = results.emergent;
  const empresaOriginal =
    resultCurrency === "usd" ? results.empresa_dolares : results.empresa_soles;

  // 2. DATOS SENSIBILIZADOS
  const selectedSens =
    sensibilizaciones.length > 0
      ? (sensibilizaciones[selectedSensIdx] ?? sensibilizaciones[0])
      : null;

  // Si no hay sensibilización, usamos datos originales
  const emergentSens = selectedSens?.mercado_emergente || emergentOriginal;
  const empresaSens = selectedSens
    ? resultCurrency === "usd"
      ? selectedSens.empresa_dolares
      : selectedSens.empresa_soles
    : empresaOriginal;

  return (
    <>
      <header className="flex flex-col xl:flex-row justify-between items-center w-full gap-6">
        <div className="xl:w-1/3 text-center xl:text-left">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Resultados generales
          </h1>
          <p className="text-gray-600">Comparación de resultados</p>
        </div>

        {/* Centro: Switch de Vistas */}
        <div className="flex flex-col items-center justify-center xl:w-1/3">
          <div className="flex gap-1 bg-slate-200/70 p-1.5 rounded-xl shadow-inner border border-slate-200">
            <button
              type="button"
              onClick={() => onToggleComparison(false)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                !showComparison
                  ? "bg-white text-valora-primary shadow-sm"
                  : "text-slate-500 hover:text-valora-primary hover:bg-slate-100"
              } cursor-pointer`}
            >
              Sensibilidad
            </button>
            <button
              type="button"
              onClick={() => onToggleComparison(true)}
              disabled={sensibilizaciones.length === 0}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                showComparison
                  ? "bg-white text-valora-primary shadow-sm"
                  : "text-slate-500 hover:text-valora-primary hover:bg-slate-100"
              } ${
                sensibilizaciones.length === 0
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              Comparación
            </button>
          </div>
          {sensibilizaciones.length === 0 && (
            <span className="text-[11px] font-semibold text-slate-500 mt-2">
              (Ingresa un β desapalancado primero)
            </span>
          )}
        </div>

        {/* Lado Derecho: Banner de Reporte */}
        <div className="xl:w-1/3 flex justify-center xl:justify-end w-full">
          <section className="flex items-center border border-slate-600 rounded-[24px] bg-white shadow-md max-w-105 w-full xl:w-fit overflow-hidden">
            <div className="relative w-30 h-30 shrink-0 overflow-hidden shadow-inner">
              <img
                src="/images/prueba_portada.jpg"
                alt="Fondo de reporte"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center gap-2 w-50 px-4 flex-1">
              <button
                onClick={onOpenReport}
                className="w-full bg-[#08203e] hover:bg-[#0c2e59] text-white text-xs font-bold py-4 px-3 rounded-xl shadow-sm transition-all active:scale-95 uppercase leading-tight tracking-wide cursor-pointer"
              >
                Genera Tu Reporte
              </button>
              <button className="flex items-center justify-center gap-2 group bg-slate-100 border border-slate-300 rounded-2xl px-1 py-1 text-slate-500 cursor-pointer hover:bg-slate-200 transition-colors">
                <File className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold group-hover:text-slate-700 transition-colors">
                  Conozca la metodología
                </span>
              </button>
            </div>
          </section>
        </div>
      </header>

      <main className="flex flex-col justify-center min-h-0 flex-1 w-full mt-6">
        {showComparison ? (
          <div className="flex flex-col xl:flex-row w-full max-w-350 mx-auto gap-2 items-center">
            {/* COLUMNA IZQUIERDA: Mercado Desarrollado estático */}
            <div className="flex flex-col justify-center w-2/5">
              <FinancieraCard
                title="Mercado Desarrollado"
                data={developedData}
                isEmpresa={false}
                resultCurrency={resultCurrency}
                onResultCurrencyChange={onResultCurrencyChange}
                compact={true}
              />
            </div>

            {/* COLUMNA DERECHA: Filas Actual y Sensibilización */}
            <div className="flex flex-col gap-6 w-full">
              {/* FILA 1: DATOS ORIGINALES BASE */}
              <div className="flex flex-col md:flex-row items-center justify-center xl:justify-start gap-4 w-full">
                <BoaIndicator
                  value={results.boa ? results.boa.toFixed(2) : "0.00"}
                />
                <FinancieraCard
                  title="Mercado Emergente"
                  data={emergentOriginal}
                  isEmpresa={false}
                  resultCurrency={resultCurrency}
                  onResultCurrencyChange={onResultCurrencyChange}
                  compact={true}
                />
                {showCompanyCard && empresaOriginal && (
                  <FinancieraCard
                    title="Tu Empresa"
                    data={empresaOriginal}
                    isEmpresa={true}
                    resultCurrency={resultCurrency}
                    onResultCurrencyChange={onResultCurrencyChange}
                    compact={true}
                  />
                )}
              </div>

              {/* SELECTOR DE SENSIBILIZACIÓN */}
              {sensibilizaciones.length > 1 && (
                <div className="w-full border-gray-200 flex items-center justify-center gap-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Sensibilización:
                  </label>
                  <select
                    value={selectedSensIdx}
                    onChange={(e) => setSelectedSensIdx(Number(e.target.value))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-valora-primary focus:border-valora-primary outline-none bg-white cursor-pointer"
                  >
                    {sensibilizaciones.map((s, idx) => (
                      <option key={idx} value={idx}>
                        (Boa = {s.boa?.toFixed(2)})
                        {s.created_at
                          ? ` — ${new Date(s.created_at).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* FILA 2: DATOS SENSIBILIZADOS */}
              {sensibilizaciones.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center justify-center xl:justify-start gap-4 w-full">
                  <BoaIndicator
                    value={
                      selectedSens?.boa ? selectedSens.boa.toFixed(2) : "0.00"
                    }
                  />
                  <FinancieraCard
                    title="Mercado Emergente"
                    data={emergentSens}
                    isEmpresa={false}
                    resultCurrency={resultCurrency}
                    onResultCurrencyChange={onResultCurrencyChange}
                    compact={true}
                  />
                  {showCompanyCard && empresaSens && (
                    <FinancieraCard
                      title="Tu Empresa"
                      data={empresaSens}
                      isEmpresa={true}
                      resultCurrency={resultCurrency}
                      onResultCurrencyChange={onResultCurrencyChange}
                      compact={true}
                    />
                  )}
                </div>
              ) : (
                <div className="w-full text-center text-gray-500 py-8">
                  No hay datos de sensibilización disponibles. Ingresa un β
                  desapalancado.
                </div>
              )}
            </div>
          </div>
        ) : (
          <section className="flex flex-col md:flex-row justify-center items-center w-full gap-4 mx-auto h-full">
            <FinancieraCard
              title="Mercado Desarrollado"
              data={developedData}
              isEmpresa={false}
              resultCurrency={resultCurrency}
              onResultCurrencyChange={onResultCurrencyChange}
              compact={false}
            />
            <FinancieraCard
              title="Mercado Emergente"
              data={emergentSens}
              isEmpresa={false}
              resultCurrency={resultCurrency}
              onResultCurrencyChange={onResultCurrencyChange}
              compact={false}
            />
            {showCompanyCard && empresaSens && (
              <FinancieraCard
                title="Tu Empresa"
                data={developedData}
                isEmpresa={true}
                resultCurrency={resultCurrency}
                onResultCurrencyChange={onResultCurrencyChange}
                compact={false}
              />
            )}
          </section>
        )}
      </main>
    </>
  );
};
