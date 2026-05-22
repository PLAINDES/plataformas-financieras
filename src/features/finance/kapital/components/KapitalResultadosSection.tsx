// features/finance/kapital/components/KapitalResultadosSection.tsx
import { FinancieraCard } from "./FinancieraCard";
import type { Results } from "../KapitalPage";
import { ArrowRight, Sparkles } from "lucide-react";

export interface KapitalResultadosSectionProps {
  results: Results;
  showCompanyCard: boolean;
  resultCurrency: "pen" | "usd";
  onResultCurrencyChange: (currency: "pen" | "usd") => void;
  onOpenReport?: () => void;
  localCurrency?: string;
  chatbotComponent?: React.ReactNode;
  shouldShowChatbot: boolean;
  onToggleForm: () => void;
}

export const KapitalResultadosSection: React.FC<
  KapitalResultadosSectionProps
> = ({
  results,
  showCompanyCard,
  resultCurrency,
  onResultCurrencyChange,
  localCurrency,
  shouldShowChatbot,
  onToggleForm,
}) => {
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
    // Usa empresa_dolares o empresa_soles en base a la moneda seleccionada
    const empresaData =
      resultCurrency === "usd"
        ? results.empresa_dolares
        : results.empresa_soles;

    const secureDEmpresa =
      empresaData?.d_empresa || results.empresa_dolares?.d_empresa || "0%";

    const newEmpresaData = {
      ...empresaData,
      d_empresa: secureDEmpresa,
    };

    cards.push({
      id: "empresa",
      title: "Resultados de la empresa",
      data: newEmpresaData,
    });
  }

  // LÓGICA DE GRID
  const gridContainerClass =
    cards.length === 3
      ? "max-w-7xl lg:grid-cols-2 xl:grid-cols-3" //xl:grid-cols-3 lg:grid-cols-2
      : "max-w-4xl md:grid-cols-1"; //lg:grid-cols-2 md:grid-cols-1

  return (
    <>
      <header className="max-lg:text-center mt-2 lg:mt-0 flex flex-col lg:flex-row justify-between items-center w-full gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Resultados generales
          </h1>
          <p className="text-gray-600">Comparación de resultados</p>
        </div>
        {/*<div className="xl:w-1/3 flex justify-center xl:justify-end w-full">
          <section className="flex flex-col items-center justify-center rounded-[24px] max-w-105 w-full xl:w-fit overflow-visible mx-auto">
            <div onClick={onOpenReport} className="w-fit h-fit cursor-pointer">
              <Book
                href="/images/portada-kapital-less.webp"
                width={110}
                height={150}
                interactive={true}
              />
            </div>
            <div className="flex flex-col justify-center gap-2 flex-1">
              <button
                onClick={onOpenReport}
                className="w-full bg-[#08203e] hover:bg-[#0c2e59] text-white text-[10px] sm:text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all active:scale-95 uppercase leading-tight tracking-wide cursor-pointer "
              >
                Reporte de Costo de Capital
              </button>
            </div>
          </section>
        </div>*/}
        {shouldShowChatbot && (
          <button
            type="button"
            onClick={onToggleForm}
            className="px-4 py-2.5 flex items-center justify-between gap-3 text-left font-semibold transition-all shadow-md w-full sm:w-auto cursor-pointer bg-valora-primary text-white rounded-xl hover:bg-valora-secondary max-w-100"
          >
            <span className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold leading-snug">
              <Sparkles className="h-5 w-5 shrink-0" />
              Encuentra tu Costo de Capital usando el Beta específico de tu
              sector
            </span>

            <ArrowRight className="h-5 w-5 shrink-0" />
          </button>
        )}
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
            localCurrency={localCurrency}
          />
        ))}
      </section>
    </>
  );
};
