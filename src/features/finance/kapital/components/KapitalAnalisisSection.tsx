// features/finance/kapital/components/KapitalAnalisisSection.tsx

import { useState, useEffect } from "react";
import { FinancieraCard } from "./FinancieraCard";
import type {
  KapitalMarketResults,
  KapitalResults,
  SensibilizacionEntry,
} from "@/shared/types";
import { formatToPeruTime } from "../services/kapital.utils";
import { ArrowRight, Sparkles, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { INDUSTRY_TRANSLATIONS } from "@/shared/constants/kapital";

const translateIndustry = (industry?: string | null) => {
  if (!industry) return industry;
  return INDUSTRY_TRANSLATIONS[industry] || industry;
};

const resolveBoaDisplay = (
  boaSector?: number | null,
  boa?: number | null,
  boaSubsector?: number | null,
  betaSubsector?: number | null
): { sector: string; subsector: string } => {
  const sectorValue = boaSector || boa || 0;
  const subsectorValue = boaSubsector || betaSubsector || boa || 0;
  return {
    sector: sectorValue ? sectorValue.toFixed(2) : "0.00",
    subsector: subsectorValue ? subsectorValue.toFixed(2) : "0.00",
  };
};

const resolveSensBoaSector = (
  sens: SensibilizacionEntry | null,
  baseResults: KapitalResults
): number | null => {
  if (!sens) return null;
  // Si la sensibilidad pertenece al mismo sector y tiene un subsector,
  // el BOA del sector debe mantener el beta del cálculo base, no el del subsector.
  if (sens.industria === baseResults.industria && sens.subsector) {
    return baseResults.boa_sector ?? baseResults.boa ?? null;
  }
  return sens.boa_sector ?? null;
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

const SectorBadge = ({
  sector,
  subsector,
}: {
  sector?: string | null;
  subsector?: string | null;
}) => {
  if (!sector && !subsector?.trim()) return null;
  const translatedSector = translateIndustry(sector);

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full sm:w-auto shrink-0">
      {sector && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-valora-primary/20 shadow-sm text-left min-h-[40px] min-w-[180px]">
          <svg
            className="w-4 h-4 text-valora-primary shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-valora-primary uppercase tracking-wider leading-none block mb-0.5">
              Sector
            </span>
            <span className="text-[12px] font-bold text-gray-900 leading-tight block break-words line-clamp-1">
              {translatedSector}
            </span>
          </div>
        </div>
      )}
      {subsector?.trim() && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-valora-primary/20 shadow-sm text-left min-h-[40px] min-w-[180px]">
          <svg
            className="w-4 h-4 text-valora-primary shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6h.008v.008H6V6z"
            />
          </svg>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-valora-primary uppercase tracking-wider leading-none block mb-0.5">
              Subsector
            </span>
            <span className="text-[12px] font-bold text-gray-900 leading-tight block break-words line-clamp-1">
              {subsector.trim()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

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
        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
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
  emphasis = "sector",
}: {
  value: number | string;
  label: string;
  sector?: string | null;
  subsector?: string | null;
  inputs?: any;
  showDropdown?: boolean;
  mode?: "sector" | "subsector" | "both";
  emphasis?: "sector" | "subsector";
}) => {
  const isBase = label.toLowerCase().includes("base");
  const translatedSector = translateIndustry(sector);
  const emphasizeSubsector = emphasis === "subsector";

  return (
    <div className="w-[210px] flex flex-col justify-between items-center px-4 py-3 bg-white border border-gray-200/80 rounded-3xl shadow-sm text-center shrink-0 border-t-4 border-t-valora-primary min-h-[130px] overflow-hidden">
      <div className="flex flex-col items-center gap-1 w-full">
        {(mode === "sector" || mode === "both") && !emphasizeSubsector && (
          <span className="text-[10px] font-black text-gray-900 uppercase leading-tight tracking-wider w-full truncate px-1">
            {translatedSector || "Sector"}
          </span>
        )}
        {(mode === "sector" || mode === "both") && emphasizeSubsector && (
          <span className="text-[9px] font-bold text-gray-500 leading-tight w-full truncate px-1">
            {translatedSector || "Sector"}
          </span>
        )}
        {(mode === "subsector" || mode === "both") && subsector && (
          <span
            className={`leading-tight w-full line-clamp-2 px-1 ${
              emphasizeSubsector
                ? "text-[10px] font-black text-gray-900 uppercase tracking-wider"
                : "text-[9px] font-bold text-gray-500"
            }`}
          >
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

export interface KapitalAnalisisSectionProps {
  results: KapitalResults;
  selectedSector?: string | null;
  selectedSubsector?: string | null;
  showCompanyCard: boolean;
  resultCurrency: "pen" | "usd";
  onResultCurrencyChange: (currency: "pen" | "usd") => void;
  emergentCurrency: "pen" | "usd";
  onEmergentCurrencyChange: (currency: "pen" | "usd") => void;
  showComparison: boolean;
  onToggleComparison: (show: boolean) => void;
  sensibilizaciones: SensibilizacionEntry[];
  onOpenReport?: () => void;
  localCurrency?: string;
  shouldShowChatbot: boolean;
  onToggleForm: () => void;
}

type TabView = "original" | "sensibility" | "comparison";

export const KapitalAnalisisSection: React.FC<KapitalAnalisisSectionProps> = ({
  results,
  selectedSector,
  selectedSubsector,
  showCompanyCard,
  resultCurrency,
  onResultCurrencyChange,
  emergentCurrency,
  onEmergentCurrencyChange,
  showComparison,
  onToggleComparison,
  sensibilizaciones,
  localCurrency,
  shouldShowChatbot,
  onToggleForm,
}) => {
  const mainIndustry = results.industria || selectedSector;
  const mainSubsector = results.subsector || selectedSubsector;

  const [selectedSensIdx, setSelectedSensIdx] = useState(0);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>("sensibility");

  useEffect(() => {
    if (showComparison && activeTab !== "comparison") {
      setActiveTab("comparison");
    } else if (!showComparison && activeTab === "comparison") {
      setActiveTab("sensibility");
    }
  }, [showComparison]);

  const handleTabChange = (tab: TabView) => {
    setActiveTab(tab);
    if (tab === "comparison") {
      onToggleComparison(true);
    } else {
      onToggleComparison(false);
    }
  };

  // 1. DATOS ORIGINALES
  const developedData = results.mercado_desarrollado ?? results.developed;

  const emergentOriginal =
    emergentCurrency === "usd"
      ? (results.mercado_emergente_dolares ?? results.emergent)
      : (results.mercado_emergente_moneda_local ?? results.emergent);

  const empresaOriginalBase =
    resultCurrency === "usd"
      ? results.empresa_dolares
      : (results.empresa_soles ?? results.empresa_moneda_local);

  const secureDEmpresaOrig =
    empresaOriginalBase?.d_empresa ||
    results.empresa_dolares?.d_empresa ||
    "0%";

  const empresaOriginal = {
    ...empresaOriginalBase,
    d_empresa: secureDEmpresaOrig,
  } as KapitalMarketResults;

  // 2. DATOS SENSIBILIZADOS
  const selectedSens =
    sensibilizaciones.length > 0
      ? (sensibilizaciones[selectedSensIdx] ?? sensibilizaciones[0])
      : null;

  // Si no hay sensibilización, usamos datos originales
  const emergentSens = selectedSens
    ? emergentCurrency === "usd"
      ? (selectedSens.mercado_emergente_dolares ??
        selectedSens.mercado_emergente ??
        emergentOriginal)
      : (selectedSens.mercado_emergente_moneda_local ??
        selectedSens.mercado_emergente ??
        emergentOriginal)
    : emergentOriginal;

  const empresaSensBase = selectedSens
    ? resultCurrency === "usd"
      ? selectedSens.empresa_dolares
      : (selectedSens.empresa_soles ?? selectedSens.empresa_moneda_local)
    : empresaOriginalBase;

  const secureDEmpresaSens =
    empresaSensBase?.d_empresa ||
    selectedSens?.empresa_dolares?.d_empresa ||
    results.empresa_dolares?.d_empresa ||
    "0%";

  const empresaSens = empresaSensBase
    ? {
      ...empresaSensBase,
      d_empresa: secureDEmpresaSens,
    }
    : undefined;

  // Sección de vista simple (sin comparación lado a lado)
  const renderSingleView = (
    dataEmergent: KapitalMarketResults,
    dataEmpresa?: KapitalMarketResults,
    boaInputs?: any,
    boaSector?: string | null,
    boaSubsector?: string | null,
    countryName?: string,
    boaSectorValue?: number | string,
    boaSubsectorValue?: number | string
  ) => (
    <section className="flex flex-col lg:flex-row justify-center items-center gap-4 w-full mx-auto px-4 max-w-none">
      <div className="shrink-0">
        <BoaIndicator
          value={boaSubsector ? (boaSubsectorValue || "0.00") : (boaSectorValue || "0.00")}
          label="boa"
          sector={boaSector}
          subsector={boaSubsector}
          inputs={boaInputs}
          showDropdown={boaInputs !== undefined}
          mode={boaSubsector ? "both" : "sector"}
          emphasis={boaSubsector ? "subsector" : "sector"}
        />
      </div>

      <div className="lg:flex-1 min-w-[340px] max-w-[450px] w-full">
        <FinancieraCard
          title="Mercado Desarrollado"
          data={developedData}
          isEmpresa={false}
          resultCurrency={resultCurrency}
          onResultCurrencyChange={onResultCurrencyChange}
          compact={false}
          localCurrency={localCurrency}
        />
      </div>

      <div className="lg:flex-1 min-w-[340px] max-w-[450px] w-full">
        <FinancieraCard
          title={`Mercado emergente: ${countryName || results.pais || ""}`}
          data={dataEmergent}
          isEmpresa={false}
          showCurrencySelect={true}
          resultCurrency={emergentCurrency}
          onResultCurrencyChange={onEmergentCurrencyChange}
          compact={false}
          localCurrency={localCurrency}
        />
      </div>

      {showCompanyCard && dataEmpresa && (
        <div className="lg:flex-1 min-w-[340px] max-w-[450px] w-full">
          <FinancieraCard
            title="Tu empresa"
            data={dataEmpresa}
            isEmpresa={true}
            resultCurrency={resultCurrency}
            onResultCurrencyChange={onResultCurrencyChange}
            compact={false}
            localCurrency={localCurrency}
          />
        </div>
      )}
    </section>
  );

  return (
    <>
      <header className="flex flex-col xl:flex-row mt-0 lg:mt-0 justify-between items-center w-full gap-2 px-4">
        {/* Izquierda: Chatbot y Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          {shouldShowChatbot && (
            <button
              type="button"
              onClick={onToggleForm}
              className="px-4 py-2 flex items-center justify-between gap-3 text-left font-semibold transition-all shadow-md w-full sm:w-auto cursor-pointer bg-valora-primary text-white rounded-xl hover:bg-valora-secondary max-w-100"
            >
              <span className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold leading-snug">
                <Sparkles className="h-5 w-5 shrink-0" />
                {selectedSubsector?.trim()
                  ? "Cambia tu subsector"
                  : "Afina tu cálculo con tu subsector específico"}
              </span>

              <ArrowRight className="h-5 w-5 shrink-0" />
            </button>
          )}

          {/* Switch de Vistas */}
          <div className="flex flex-col items-center sm:items-start justify-center">
            <div className="flex gap-1 bg-slate-200/70 p-1 rounded-xl shadow-inner border border-slate-200">
              <button
                type="button"
                onClick={() => handleTabChange("original")}
                className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                  activeTab === "original"
                    ? "bg-white text-valora-primary shadow-sm"
                    : "text-slate-500 hover:text-valora-primary hover:bg-slate-100"
                } cursor-pointer`}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("sensibility")}
                className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                  activeTab === "sensibility"
                    ? "bg-white text-valora-primary shadow-sm"
                    : "text-slate-500 hover:text-valora-primary hover:bg-slate-100"
                } cursor-pointer`}
              >
                Sensibilidad
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("comparison")}
                disabled={sensibilizaciones.length === 0}
                className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                  activeTab === "comparison"
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
              <span className="text-[11px] font-semibold text-slate-500 mt-1">
                (Ingresa un β desapalancado primero)
              </span>
            )}
          </div>
        </div>
      </header>


      <main className="flex flex-col justify-center min-h-0 flex-1 w-full mt-2">
        {activeTab === "comparison" ? (
          <div className="flex flex-col w-full max-w-[1600px] mx-auto gap-4 items-center">
            {/* COLUMNA DERECHA: Filas Actual y Sensibilización */}
            <div className="flex flex-col gap-6 w-full">
              {/* SELECTOR DE ESCENARIO FLOTANTE */}
              {sensibilizaciones.length > 0 && (
                <>
                  {/* Botón flotante */}
                  <button
                    type="button"
                    onClick={() => setScenarioOpen((prev) => !prev)}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-valora-primary text-white rounded-full shadow-lg hover:bg-valora-secondary transition-all cursor-pointer"
                  >
                    <SlidersHorizontal size={18} />
                    <span className="text-sm font-bold max-w-[180px] truncate">
                      Escenarios de sensibilidad
                    </span>
                  </button>

                  {/* Panel desplegable */}
                  {scenarioOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/10"
                        onClick={() => setScenarioOpen(false)}
                      />
                      <div className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] max-h-[70vh] flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                          <div className="flex items-center gap-2 text-valora-primary">
                            <SlidersHorizontal size={16} />
                            <span className="text-sm font-bold text-gray-800">
                              Escenario de sensibilización
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setScenarioOpen(false)}
                            className="p-1 hover:bg-slate-100 rounded-full text-gray-500 transition-colors cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
                          <div className="flex flex-col gap-2">
                            {sensibilizaciones.map((s, idx) => {
                              const isSelected = idx === selectedSensIdx;
                              const label = s.subsector
                                ? s.subsector
                                : s.industria
                                  ? translateIndustry(s.industria) || s.industria
                                  : "Escenario";
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSensIdx(idx);
                                    setScenarioOpen(false);
                                  }}
                                  className={`text-left px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-valora-primary/10 border border-valora-primary text-valora-primary font-bold"
                                      : "bg-slate-50 border border-transparent text-gray-700 hover:bg-slate-100"
                                  }`}
                                >
                                  <span className="block leading-snug break-words">
                                    {label}
                                  </span>
                                  <span className="block text-[11px] opacity-80 mt-0.5">
                                    Boa = {s.boa?.toFixed(2)}
                                    {s.created_at
                                      ? ` — ${formatToPeruTime(s.created_at)}`
                                      : ""}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-3 shrink-0">
                          Selecciona un escenario para comparar contra el cálculo original.
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* FILA 1: DATOS ORIGINALES BASE */}
              <div className="flex flex-col xl:flex-row items-center justify-center mt-4 xl:mt-0 gap-4 w-full">
                <div className="shrink-0">
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
                    label="base"
                    sector={mainIndustry}
                    subsector={mainSubsector}
                    inputs={results.inputs}
                    showDropdown={results.inputs !== undefined}
                    mode={mainSubsector ? "both" : "sector"}
                    emphasis={mainSubsector ? "subsector" : "sector"}
                  />
                </div>
                <section className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
                  <div className="min-w-[300px] max-w-[450px] w-full">
                    <FinancieraCard
                      title="Mercado Desarrollado"
                      data={developedData}
                      isEmpresa={false}
                      resultCurrency={resultCurrency}
                      onResultCurrencyChange={onResultCurrencyChange}
                      compact={false}
                    />
                  </div>
                  <div className="min-w-[300px] max-w-[450px] w-full">
                    <FinancieraCard
                      title={`Mercado emergente: ${results.pais || ""}`}
                      data={emergentOriginal}
                      isEmpresa={false}
                      showCurrencySelect={true}
                      resultCurrency={emergentCurrency}
                      onResultCurrencyChange={onEmergentCurrencyChange}
                      compact={false}
                      localCurrency={localCurrency}
                    />
                  </div>
                  {showCompanyCard && empresaOriginal && (
                    <div className="min-w-[300px] max-w-[450px] w-full">
                      <FinancieraCard
                        title="Tu empresa"
                        data={empresaOriginal}
                        isEmpresa={true}
                        resultCurrency={resultCurrency}
                        onResultCurrencyChange={onResultCurrencyChange}
                        compact={false}
                        localCurrency={localCurrency}
                      />
                    </div>
                  )}
                </section>
              </div>

              {/* FILA 2: DATOS SENSIBILIZADOS */}
              {sensibilizaciones.length > 0 ? (
                (() => {
                  const sensBoaSector = resolveSensBoaSector(selectedSens, results);
                  return (
                    <div className="flex flex-col xl:flex-row items-center justify-center gap-4 w-full">
                      <div className="shrink-0">
                        <BoaIndicator
                          value={
                            selectedSens?.subsector
                              ? selectedSens?.boa_subsector
                                ? selectedSens.boa_subsector.toFixed(2)
                                : selectedSens?.beta_subsector
                                  ? selectedSens.beta_subsector.toFixed(2)
                                  : selectedSens?.boa
                                    ? selectedSens.boa.toFixed(2)
                                    : "0.00"
                              : sensBoaSector
                                ? sensBoaSector.toFixed(2)
                                : selectedSens?.boa
                                  ? selectedSens.boa.toFixed(2)
                                  : "0.00"
                          }
                          label="sensibilidad"
                          sector={selectedSens?.industria}
                          subsector={selectedSens?.subsector}
                          inputs={selectedSens?.inputs}
                          showDropdown={selectedSens?.inputs !== undefined}
                          mode={selectedSens?.subsector ? "both" : "sector"}
                          emphasis={selectedSens?.subsector ? "subsector" : "sector"}
                        />
                      </div>
                      <section className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
                        <div className="min-w-[300px] max-w-[450px] w-full">
                          <FinancieraCard
                            title="Mercado Desarrollado"
                            data={
                              selectedSens?.mercado_desarrollado || developedData
                            }
                            isEmpresa={false}
                            compact={false}
                          />
                        </div>
                        <div className="min-w-[300px] max-w-[450px] w-full">
                          <FinancieraCard
                            title={`Mercado emergente: ${selectedSens?.inputs?.pais || results.pais || ""}`}
                            data={emergentSens}
                            isEmpresa={false}
                            showCurrencySelect={true}
                            resultCurrency={emergentCurrency}
                            onResultCurrencyChange={onEmergentCurrencyChange}
                            compact={false}
                            localCurrency={localCurrency}
                          />
                        </div>
                        {showCompanyCard && empresaSens && (
                          <div className="min-w-[300px] max-w-[450px] w-full">
                            <FinancieraCard
                              title="Tu empresa"
                              data={empresaSens}
                              isEmpresa={true}
                              resultCurrency={resultCurrency}
                              onResultCurrencyChange={onResultCurrencyChange}
                              compact={false}
                              localCurrency={localCurrency}
                            />
                          </div>
                        )}
                      </section>
                    </div>
                  );
                })()
              ) : (
                <div className="w-full text-center text-gray-500 py-8">
                  No hay datos de sensibilización disponibles. Ingresa un β
                  desapalancado.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "original" ? (
          <div className="flex flex-col items-center justify-center gap-2 w-full max-w-none mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex flex-col text-center sm:text-left">
                <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                  Resultados generales
                </h1>
                <p className="text-gray-600 text-[11px]">
                  Comparación de resultados
                </p>
              </div>
              <SectorBadge sector={mainIndustry} subsector={mainSubsector} />
            </div>
            <div className="w-full">
              {(() => {
                const boaDisplay = resolveBoaDisplay(
                  results.boa_sector,
                  results.boa,
                  results.boa_subsector,
                  results.inputs?.beta_subsector
                );
                return renderSingleView(
                  emergentOriginal,
                  empresaOriginal,
                  results.inputs,
                  mainIndustry,
                  mainSubsector,
                  results.pais,
                  boaDisplay.sector,
                  boaDisplay.subsector
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 w-full max-w-none mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex flex-col text-center sm:text-left">
                <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                  Resultados generales
                </h1>
                <p className="text-gray-600 text-[11px]">
                  Comparación de resultados
                </p>
              </div>
              <SectorBadge
                sector={selectedSens?.industria}
                subsector={selectedSens?.subsector}
              />
            </div>
            <div className="w-full">
              {(() => {
                const sensBoaDisplay = resolveBoaDisplay(
                  resolveSensBoaSector(selectedSens, results),
                  selectedSens?.boa,
                  selectedSens?.boa_subsector,
                  selectedSens?.beta_subsector
                );
                return renderSingleView(
                  emergentSens,
                  empresaSens,
                  selectedSens?.inputs,
                  selectedSens?.industria,
                  selectedSens?.subsector,
                  selectedSens?.inputs?.pais || results.pais,
                  sensBoaDisplay.sector,
                  sensBoaDisplay.subsector
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </>
  );
};
