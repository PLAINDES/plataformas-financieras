// features/finance/kapital/components/KapitalAnalisisSection.tsx

import { useState } from "react";
import { FinancieraCard, type MarketResults } from "./FinancieraCard";
import type { Results, SensibilizacionEntry } from "../KapitalPage";

const BoaIndicator = ({ value }: { value: number | string }) => (
  <div className="w-1/4 flex justify-center items-center h-full m-auto px-4">
    <div className="flex items-baseline gap-4">
      <div className="flex items-baseline text-[#0088cc]">
        {" "}
        <span className="text-6xl lg:text-8xl font-serif">β</span>
        <span className="text-lg lg:text-xl font-bold">oa</span>
      </div>
      <span className="text-3xl lg:text-4xl font-normal text-gray-900">
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
  onToggleComparison: () => void;
  sensibilizaciones: SensibilizacionEntry[];
}

interface CardItem {
  id: string;
  title: string;
  data: MarketResults;
  highlight: boolean;
  boa?: number;
}

export const KapitalAnalisisSection: React.FC<KapitalAnalisisSectionProps> = ({
  results,
  showCompanyCard,
  resultCurrency,
  onResultCurrencyChange,
  showComparison,
  onToggleComparison,
  sensibilizaciones,
}) => {
  const [selectedSensIdx, setSelectedSensIdx] = useState(0);

  const developedCardData = results.developed;

  // 2. CONSTRUIR ROW ACTUAL (Emergente y Empresa)
  const cards: CardItem[] = [
    {
      id: "emergent",
      title: "Mercado Emergente",
      data: results.emergent,
      highlight: false,
    },
  ];

  if (showCompanyCard) {
    const empresaData =
      resultCurrency === "usd"
        ? results.empresa_dolares
        : results.empresa_soles;
    cards.push({
      id: "empresa",
      title: "Tu Empresa",
      data: empresaData,
      highlight: true,
    });
  }

  // FILA DE COMPARACIÓN (Sensibilización: Emergente y Empresa)
  const selectedSens =
    sensibilizaciones.length > 0
      ? (sensibilizaciones[selectedSensIdx] ?? sensibilizaciones[0])
      : null;

  const comparisonCards: CardItem[] = [];
  if (selectedSens) {
    if (selectedSens.mercado_emergente) {
      comparisonCards.push({
        id: "comp-emergent",
        title: "Mercado Emergente",
        data: selectedSens.mercado_emergente,
        highlight: false,
      });
    }
    if (showCompanyCard) {
      const compEmpresa =
        resultCurrency === "usd"
          ? selectedSens.empresa_dolares
          : selectedSens.empresa_soles;
      if (compEmpresa) {
        comparisonCards.push({
          id: "comp-empresa",
          title: "Tu Empresa",
          data: compEmpresa,
          highlight: true,
        });
      }
    }
  }

  // Lógica de grillas dinámicas
  const originalGridClass = showCompanyCard
    ? "max-w-7xl lg:grid-cols-3"
    : "max-w-4xl lg:grid-cols-2";

  // Cuando hay comparación, la fila derecha requiere espacio para (Boa) + (Emergente) + (Empresa opcional)
  const comparisonRowGridClass = showCompanyCard
    ? "lg:grid-cols-[auto_1fr_1fr]"
    : "lg:grid-cols-[auto_1fr]";
  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-center w-full">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Resultados generales
          </h1>
          <p className="text-gray-600">Comparación de resultados</p>
        </div>
        <a className="border border-gray-300 relative w-24 h-24 self-end bg-linear-to-br from-slate-300 to-slate-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <img
            src="/images/logo-valora.png"
            className="absolute w-16 h-10 my-auto"
          />
        </a>
      </header>

      <main className="flex flex-col justify-center min-h-0 flex-1 w-full">
        {showComparison ? (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,1fr)_3fr] w-full max-w-[1400px] mx-auto gap-8 items-center">
            {/* COLUMNA IZQUIERDA: Mercado Desarrollado estático */}
            <div className="flex flex-col justify-center w-full">
              <FinancieraCard
                title="Mercado Desarrollado"
                data={developedCardData}
                isEmpresa={false}
                resultCurrency={resultCurrency}
                onResultCurrencyChange={onResultCurrencyChange}
                compact={true}
              />
            </div>

            {/* COLUMNA DERECHA: Filas Actual y Sensibilización */}
            <div className="flex flex-col gap-6 w-full">
              {/* FILA 1: ACTUAL */}
              <div
                className={`grid grid-cols-1 md:grid-cols-2 ${comparisonRowGridClass} gap-4 items-start`}
              >
                <BoaIndicator
                  value={results.boa ? results.boa.toFixed(2) : "0.00"}
                />
                {cards.map((card) => (
                  <FinancieraCard
                    key={card.id}
                    title={card.title}
                    data={card.data}
                    isEmpresa={card.id === "empresa"}
                    resultCurrency={resultCurrency}
                    onResultCurrencyChange={onResultCurrencyChange}
                    compact={true}
                  />
                ))}
              </div>

              {/* SELECTOR DE SENSIBILIZACIÓN */}
              {sensibilizaciones.length > 1 && (
                <div className="w-full border-t border-gray-200 pt-4 flex items-center justify-center gap-3">
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

              {/* FILA 2: COMPARACIÓN SENSIBILIZADA */}
              {comparisonCards.length > 0 ? (
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 ${comparisonRowGridClass} gap-4 items-start`}
                >
                  <BoaIndicator
                    value={
                      selectedSens?.boa ? selectedSens.boa.toFixed(2) : "0.00"
                    }
                  />
                  {comparisonCards.map((card) => (
                    <FinancieraCard
                      key={card.id}
                      title={card.title}
                      data={card.data}
                      isEmpresa={card.id === "comp-empresa"}
                      resultCurrency={resultCurrency}
                      onResultCurrencyChange={onResultCurrencyChange}
                      compact={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full text-center text-gray-500 py-8">
                  No hay datos de sensibilización disponibles. Ingresa un β
                  desapalancado y presiona &ldquo;CALCULA TU WACC&rdquo;.
                </div>
              )}
            </div>
          </div>
        ) : (
          <section
            className={`grid grid-cols-1 md:grid-cols-2 ${originalGridClass} w-full gap-4 mx-auto justify-center h-full items-center`}
          >
            {/* Mercado Desarrollado primero */}
            <FinancieraCard
              title="Mercado Desarrollado"
              data={developedCardData}
              isEmpresa={false}
              resultCurrency={resultCurrency}
              onResultCurrencyChange={onResultCurrencyChange}
              compact={false}
            />
            {cards.map((card) => (
              <FinancieraCard
                key={card.id}
                title={card.title}
                data={card.data}
                isEmpresa={card.id === "empresa"}
                resultCurrency={resultCurrency}
                onResultCurrencyChange={onResultCurrencyChange}
                compact={false}
              />
            ))}
          </section>
        )}
      </main>
      {/* Botón inferior / Comparison section */}
      {!showComparison && (
        <div className="shrink-0 flex justify-center pb-2 mt-6">
          <button
            type="button"
            onClick={onToggleComparison}
            disabled={sensibilizaciones.length === 0}
            className={`px-6 py-3 border border-gray-300 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
              sensibilizaciones.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-valora-primary text-white hover:bg-valora-secondary hover:text-white cursor-pointer"
            }`}
          >
            Comparación con resultados generales
            {sensibilizaciones.length === 0 && (
              <span className="text-xs font-normal ml-1">
                (Ingresa un β desapalancado primero)
              </span>
            )}
          </button>
        </div>
      )}
    </>
  );
};
