// features/finance/kapital/components/KapitalResultadosSection.tsx
import { FinancieraCard } from "./FinancieraCard";
import type { KapitalResults } from "@/shared/types";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { INDUSTRY_TRANSLATIONS } from "@/shared/constants/kapital";
import { useEffect, useState } from "react";

const translateIndustry = (industry?: string | null) => {
  if (!industry) return industry;
  return INDUSTRY_TRANSLATIONS[industry] || industry;
};

const InputDetail = ({
  label,
  value,
}: {
    label: string;
    value: string | number;
}) => (
  <div className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
    <span className="text-[10px] text-gray-500 font-medium">{label}</span>
    <span className="text-[10px] text-gray-700 font-bold">{value}</span>
  </div>
);

const InputsDropdown = ({ inputs, label }: { inputs: any; label?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!inputs) return null;

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-1 py-1.5 px-2 text-[10px] font-medium text-gray-500 hover:text-valora-primary transition-colors border-t border-gray-100 mt-2"
      >
        <span className="truncate">{label || "Ver parámetros usados"}</span>
        <ChevronDown
          size={12}
          className={`shrink-0 transition-transform duration-500 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-2 mt-1 opacity-100 transition-opacity duration-500 bg-slate-50 rounded-lg border border-slate-200 shadow-sm mb-1">
            <InputDetail label="Costo Deuda" value={`${inputs.costo_deuda}%`} />
            <InputDetail label="Deuda" value={`${inputs.porcentaje_deuda}%`} />
            <InputDetail
              label="Capital"
              value={`${inputs.porcentaje_capital}%`}
            />
            <InputDetail label="Devaluación" value={`${inputs.devaluacion}%`} />
            <InputDetail
              label="Tasa Imp."
              value={`${inputs.tasa_impositiva}%`}
            />
            {inputs.damodaran?.beta && (
              <InputDetail
                label="Beta (Damo)"
                value={inputs.damodaran.beta.toFixed(3)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BoaIndicator = ({
  value,
  label,
  sector,
  subsector,
  inputs,
  showDropdown = true,
  mode = "both",
}: {
    value: number | string;
    label: string;
    sector?: string | null;
    subsector?: string | null;
    inputs?: any;
    showDropdown?: boolean;
    mode?: "sector" | "subsector" | "both";
}) => {
  const isBase = label.toLowerCase().includes("base");
  const translatedSector = translateIndustry(sector);

  return (
    <div className="w-[210px] flex flex-col justify-between items-center px-4 py-3 bg-white border border-gray-200/80 rounded-3xl shadow-sm text-center shrink-0 border-t-4 border-t-valora-primary min-h-[130px] overflow-hidden">
      <div className="flex flex-col items-center gap-1 w-full">
        {(mode === "sector" || mode === "both") && (
          <span className="text-[10px] font-black text-gray-900 uppercase leading-tight tracking-wider w-full truncate px-1">
            {translatedSector || "Sector"}
          </span>
        )}
        {(mode === "subsector" || mode === "both") && subsector && (
          <span className="text-[9px] font-bold text-gray-500 leading-tight w-full line-clamp-2 px-1">
            {subsector}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <div className="flex items-baseline text-valora-primary">
          <span className="text-2xl lg:text-3xl font-serif leading-none">
                        β
          </span>
          <span className="text-[10px] font-bold leading-none ml-0.5">
                        oa
          </span>
        </div>
        <span className="text-xl lg:text-2xl font-bold text-gray-800 leading-none">
          {value}
        </span>
      </div>

      <div className="w-full">
        {showDropdown && (
          <InputsDropdown
            inputs={inputs}
            label={isBase ? "Beta económico Sector" : "Beta económico Sensibilidad"}
          />
        )}
      </div>
    </div>
  );
};

const SectorBadge = ({ sector, subsector }: { sector?: string | null, subsector?: string | null }) => {
  if (!sector && !subsector?.trim()) return null;
  const translatedSector = translateIndustry(sector);

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full sm:w-auto shrink-0">
      {sector && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-valora-primary/20 shadow-sm text-left min-h-[40px] min-w-[180px]">
          <svg className="w-4 h-4 text-valora-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-valora-primary uppercase tracking-wider leading-none block mb-0.5">Sector</span>
            <span className="text-[12px] font-bold text-gray-900 leading-tight block break-words line-clamp-1">{translatedSector}</span>
          </div>
        </div>
      )}
      {subsector?.trim() && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-valora-primary/20 shadow-sm text-left min-h-[40px] min-w-[180px]">
          <svg className="w-4 h-4 text-valora-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-valora-primary uppercase tracking-wider leading-none block mb-0.5">Subsector</span>
            <span className="text-[12px] font-bold text-gray-900 leading-tight block break-words line-clamp-1">{subsector.trim()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export interface KapitalResultadosSectionProps {
    results: KapitalResults;
    selectedSector?: string | null;
    selectedSubsector?: string | null;
    showCompanyCard: boolean;
    resultCurrency: "pen" | "usd";
    onResultCurrencyChange: (currency: "pen" | "usd") => void;
    emergentCurrency: "pen" | "usd";
    onEmergentCurrencyChange: (currency: "pen" | "usd") => void;
    // onOpenReport?: () => void;
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
  emergentCurrency,
  onEmergentCurrencyChange,
  // onOpenReport,
  localCurrency,
  shouldShowChatbot,
  onToggleForm,
}) => {

  const mainIndustry = results.industria || selectedSector;
  const mainSubsector = results.subsector || selectedSubsector;

  // Resolve empresa data with secure d_empresa fallback
  const empresaDataRaw = resultCurrency === "usd"
    ? results.empresa_dolares
    : results.empresa_soles ?? results.empresa_moneda_local;

  const secureDEmpresa = empresaDataRaw?.d_empresa || results.empresa_dolares?.d_empresa || "0%";

  const empresaData = empresaDataRaw ? {
    ...empresaDataRaw,
    d_empresa: secureDEmpresa
  } : undefined;

  // Resolve mercado emergente por moneda seleccionada
  const emergentData =
        emergentCurrency === "usd"
          ? results.mercado_emergente_dolares ?? results.emergent
          : results.mercado_emergente_moneda_local ?? results.emergent;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const cardMotion =
    mounted
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-6";

  return (
    <>
      <header className="flex flex-col gap-4 w-full px-4 py-4">
        <div className="flex justify-start items-center w-full">
          {shouldShowChatbot && (
            <button
              type="button"
              onClick={onToggleForm}
              className="px-4 py-2 flex items-center justify-between gap-3 text-left font-semibold transition-all shadow-md w-full sm:w-auto cursor-pointer bg-valora-primary text-white rounded-xl hover:bg-valora-secondary max-w-100"
            >
              <span className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold leading-snug">
                <Sparkles className="h-5 w-5 shrink-0" />
                {selectedSubsector?.trim() ? "Cambia tu subsector" : "Afina tu cálculo con tu subsector específico"}
              </span>

              <ArrowRight className="h-5 w-5 shrink-0" />
            </button>
          )}
        </div>

        <div className="flex flex-row items-end justify-center gap-4 w-full">
          <div className="flex flex-col text-center">
            <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                            Resultados generales
            </h1>
            <p className="text-gray-600 text-[11px]">
                            Comparación de resultados
            </p>
          </div>
          <div className="flex items-center gap-4">
            <SectorBadge sector={mainIndustry} subsector={mainSubsector} />
          </div>
        </div>

        {/*
        {onOpenReport && (
          <div className="flex justify-end items-end">
            <section className="flex flex-col items-center justify-center rounded-[24px] max-w-105 w-full xl:w-fit overflow-visible">
              <div onClick={onOpenReport} className="w-fit h-fit cursor-pointer">
                <Book
                  href="/images/portada-kapital-less.webp"
                  width={110}
                  height={150}
                  interactive={true}
                />
              </div>
              <div className="flex flex-col justify-center gap-2 flex-1 mt-2">
                <button
                  type="button"
                  onClick={onOpenReport}
                  className="w-full bg-[#08203e] hover:bg-[#0c2e59] text-white text-[10px] sm:text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all active:scale-95 uppercase leading-tight tracking-wide cursor-pointer"
                >
                  Reporte de Costo de Capital
                </button>
              </div>
            </section>
          </div>
        )}
        */}
      </header>
      <section className="flex flex-col lg:flex-row justify-center items-center w-full gap-4 mt-2 mx-auto px-4 max-w-none min-h-[calc(100dvh-14rem)]">
        <div
          className={`shrink-0 transform-gpu transition-all ease-out duration-700 will-change-transform ${cardMotion}`}
          style={{ transitionDelay: mounted ? "0ms" : "0ms" }}
        >
          <BoaIndicator
            value={
              mainSubsector
                ? results.boa_subsector
                  ? results.boa_subsector.toFixed(2)
                  : results.boa
                    ? results.boa.toFixed(2)
                    : "0.00"
                : results.boa_sector
                  ? results.boa_sector.toFixed(2)
                  : results.boa
                    ? results.boa.toFixed(2)
                    : "0.00"
            }
            label="boa"
            sector={mainIndustry}
            subsector={mainSubsector}
            inputs={results.inputs}
            showDropdown={results.inputs !== undefined}
            mode={mainSubsector ? "both" : "sector"}
          />
        </div>

        <div
          className={`lg:flex-1 min-w-[340px] max-w-[450px] w-full transform-gpu transition-all ease-out duration-700 will-change-transform ${cardMotion}`}
          style={{ transitionDelay: mounted ? "140ms" : "0ms" }}
        >
          <FinancieraCard
            title="Mercado Desarrollado"
            data={results.mercado_desarrollado ?? results.developed}
            isEmpresa={false}
            compact={false}
            localCurrency={localCurrency}
          />
        </div>

        <div
          className={`lg:flex-1 min-w-[340px] max-w-[450px] w-full transform-gpu transition-all ease-out duration-700 will-change-transform ${cardMotion}`}
          style={{ transitionDelay: mounted ? "280ms" : "0ms" }}
        >
          <FinancieraCard
            title={`Mercado emergente: ${results.pais || ""}`}
            data={emergentData}
            isEmpresa={false}
            showCurrencySelect={true}
            resultCurrency={emergentCurrency}
            onResultCurrencyChange={onEmergentCurrencyChange}
            compact={false}
            localCurrency={localCurrency}
          />
        </div>

        {showCompanyCard && empresaData && (
          <div
            className={`lg:flex-1 min-w-[340px] max-w-[450px] w-full transform-gpu transition-all ease-out duration-700 will-change-transform ${cardMotion}`}
            style={{ transitionDelay: mounted ? "420ms" : "0ms" }}
          >
            <FinancieraCard
              title="Tu empresa"
              data={empresaData}
              isEmpresa={true}
              resultCurrency={resultCurrency}
              onResultCurrencyChange={onResultCurrencyChange}
              compact={false}
              localCurrency={localCurrency}
            />
          </div>
        )}
      </section>

    </>
  );

};
