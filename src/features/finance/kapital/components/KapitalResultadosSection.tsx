// features/finance/kapital/components/KapitalResultadosSection.tsx

import { FinancieraCard } from "./FinancieraCard";
import type { Results } from "../KapitalPage";

export interface KapitalResultadosSectionProps {
  results: Results;
  showCompanyCard: boolean;
  resultCurrency: "pen" | "usd";
  onResultCurrencyChange: (currency: "pen" | "usd") => void;
}

export const KapitalResultadosSection: React.FC<
  KapitalResultadosSectionProps
> = ({ results, showCompanyCard, resultCurrency, onResultCurrencyChange }) => {
  // 1. Armamos el arreglo de tarjetas. Siempre incluimos los mercados.
  const cards = [
    {
      id: "developed",
      title: "Resultados del mercado desarrollado",
      data: results.developed,
    },
    {
      id: "emergent",
      title: "Resultados del mercado emergente",
      data: results.emergent,
    },
  ];

  if (showCompanyCard) {
    // Use empresa_dolares or empresa_soles based on resultCurrency toggle
    const empresaData =
      resultCurrency === "usd"
        ? results.empresa_dolares
        : results.empresa_soles;
    cards.push({
      id: "empresa",
      title: "Resultados de la empresa",
      data: empresaData,
    });
  }

  // LÓGICA DE GRID
  const gridContainerClass =
    cards.length === 3
      ? "max-w-7xl lg:grid-cols-2 xl:grid-cols-3" //xl:grid-cols-3 lg:grid-cols-2
      : "max-w-4xl md:grid-cols-1"; //lg:grid-cols-2 md:grid-cols-1

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
      <section
        className={`grid grid-cols-1 md:grid-cols-2 ${gridContainerClass} w-full gap-6 mx-auto justify-center`}
      >
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
    </>
  );
};
