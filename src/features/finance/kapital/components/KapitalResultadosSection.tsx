// features/finance/kapital/components/KapitalResultadosSection.tsx
import { FinancieraCard } from "./FinancieraCard";
import type { KapitalResults } from "@/shared/types";
import { ArrowRight, Sparkles } from "lucide-react";
//import { Book } from "./Book";

export interface KapitalResultadosSectionProps {
    results: KapitalResults;
    selectedSector?: string | null;
    selectedSubsector?: string | null;
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
    selectedSector,
    selectedSubsector,
    showCompanyCard,
    resultCurrency,
    onResultCurrencyChange,
    localCurrency,
    shouldShowChatbot,
    onToggleForm,
    //onOpenReport,
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

        return (
            <>
                <header className="max-lg:text-center mt-2 lg:mt-0 flex flex-col xl:flex-row-reverse justify-between items-center w-full gap-4">
                    <div
                        className={`flex flex-1 flex-col justify-center items-start ${shouldShowChatbot ? "xl:pl-15" : "xl:pl-0"}`}
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">
                                Resultados generales
                            </h1>
                            {(selectedSector || selectedSubsector?.trim()) && (
                                <div className="flex flex-col sm:flex-row items-stretch gap-0 sm:gap-px bg-valora-primary/[0.06] rounded-xl overflow-hidden border border-valora-primary/20 max-sm:w-full w-auto shrink-0">
                                    {selectedSector && (
                                        <div className="flex items-center gap-2.5 px-4 py-3 bg-white border-b sm:border-b-0 sm:border-r border-valora-primary/[0.06] text-left">
                                            <svg className="w-5 h-5 text-valora-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                            </svg>
                                            <div>
                                                <span className="text-[10px] font-bold text-valora-primary uppercase tracking-wider leading-none block">Sector</span>
                                                <span className="text-sm font-bold text-gray-900 leading-tight">{selectedSector}</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedSubsector?.trim() && (
                                        <div className="flex items-center gap-2.5 px-4 py-3 bg-white text-left">
                                            <svg className="w-5 h-5 text-valora-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                                            </svg>
                                            <div>
                                                <span className="text-[10px] font-bold text-valora-primary uppercase tracking-wider leading-none block">Subsector</span>
                                                <span className="text-sm font-bold text-gray-900 leading-tight">{selectedSubsector.trim()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-gray-600 max-xl:mx-auto">
                            Comparación de resultados
                        </p>
                    </div>
                    {shouldShowChatbot && (
                        <button
                            type="button"
                            onClick={onToggleForm}
                            className="px-4 py-2.5 flex items-center justify-between gap-3 text-left font-semibold transition-all shadow-md w-full sm:w-auto cursor-pointer bg-valora-primary text-white rounded-xl hover:bg-valora-secondary max-w-100"
                        >
                            <span className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold leading-snug">
                                <Sparkles className="h-5 w-5 shrink-0" />
                                {selectedSubsector?.trim() ? "Cambia tu subsector" : "Afina tu cálculo con tu subsector específico"}
                            </span>

                            <ArrowRight className="h-5 w-5 shrink-0" />
                        </button>
                    )}
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
                </header>
                <section className="flex flex-col flex-wrap md:flex-row justify-center items-center w-full gap-4 mt-6 mx-auto h-full">
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
