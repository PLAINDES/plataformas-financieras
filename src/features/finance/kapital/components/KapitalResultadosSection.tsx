// features/finance/kapital/components/KapitalResultadosSection.tsx
import { FinancieraCard } from "./FinancieraCard";
import type { Results } from "../KapitalPage";
import { Info } from "lucide-react";
import { Book } from "./Book";

export interface KapitalResultadosSectionProps {
  results: Results;
  showCompanyCard: boolean;
  resultCurrency: "pen" | "usd";
  onResultCurrencyChange: (currency: "pen" | "usd") => void;
  onSensibilizaClick: () => void;
  onOpenReport?: () => void;
  localCurrency?: string;
}

export const KapitalResultadosSection: React.FC<
  KapitalResultadosSectionProps
> = ({
  results,
  showCompanyCard,
  resultCurrency,
  onResultCurrencyChange,
  onSensibilizaClick,
  onOpenReport,
  localCurrency,
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
      empresaData?.D_empresa || results.empresa_dolares?.D_empresa || "0%";

    const newEmpresaData = {
      ...empresaData,
      D_empresa: secureDEmpresa,
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
        <div className="xl:w-1/3 flex justify-center xl:justify-end w-full">
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
        </div>
        <div className="flex flex-row items-center gap-2">
          <button
            className="px-4 py-2 bg-valora-primary font-bold text-white rounded-lg h-fit cursor-pointer hover:bg-valora-secondary"
            onClick={onSensibilizaClick}
          >
            Sensibiliza tu beta
          </button>
          <div className="relative flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <Info
                className="w-4 h-4 text-gray-400 cursor-help"
                onMouseEnter={(e) => {
                  const tip = e.currentTarget.nextElementSibling as HTMLElement;
                  tip.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  const tip = e.currentTarget.nextElementSibling as HTMLElement;
                  tip.style.opacity = "0";
                }}
              />
              <div className="absolute bottom-full mb-2 right-0 w-48 py-2.5 px-3 bg-gray-100 text-black text-[11px] rounded-md shadow-lg opacity-0 transition-opacity duration-200 z-50 pointer-events-none">
                <p className="text-blue-800 leading-relaxed">
                  <strong>Sugerencia: </strong>
                  Use el chatbot de análisis financiero para obtener estos datos
                  automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
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
