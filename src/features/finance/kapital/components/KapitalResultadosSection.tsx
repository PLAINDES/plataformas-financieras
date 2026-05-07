// features/finance/kapital/components/KapitalResultadosSection.tsx
import { FinancieraCard } from "./FinancieraCard";
import type { Results } from "../KapitalPage";
import { File, Info } from "lucide-react";

export interface KapitalResultadosSectionProps {
  results: Results;
  showCompanyCard: boolean;
  resultCurrency: "pen" | "usd";
  onResultCurrencyChange: (currency: "pen" | "usd") => void;
  onSensibilizaClick: () => void;
  onOpenReport?: () => void;
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
        <section className="flex items-center border border-slate-600 rounded-[24px] bg-white shadow-md max-w-105 w-fit overflow-hidden">
          <div className="relative w-30 h-30 shrink-0 overflow-hidden shadow-inner">
            <img
              src="/images/reportes-bg.jpg"
              alt="Fondo de reporte"
              className="w-full h-full object-cover"
            />

            <div className="absolute flex flex-col justify-center items-center bottom-0 left-0 right-0 bg-white text-center shadow-sm w-full h-15 gap-0.5">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">
                Reporte Especializado
              </p>
              <p className="text-[10px] font-bold text-black uppercase leading-tight">
                Costo de Capital
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-2 w-50 px-4">
            <button
              className="w-full bg-[#08203e] hover:bg-[#0c2e59] text-white text-xs font-bold py-4 px-3 rounded-xl shadow-sm transition-all active:scale-95 uppercase leading-tight tracking-wide cursor-pointer"
              onClick={onOpenReport}
            >
              Genera Tu Reporte
            </button>
            <button className="flex items-center justify-center gap-2 group bg-slate-100 border border-slate-300 rounded-2xl px-1 text-slate-500 cursor-pointer">
              <div className="py-1 rounded-md group-hover:bg-slate-200 transition-colors">
                <File className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold group-hover:text-slate-700 group-hover:border-slate-400 transition-all">
                Conozca la metodología
              </span>
            </button>
          </div>
        </section>
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
          />
        ))}
      </section>
    </>
  );
};
