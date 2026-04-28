// features/finance/kapital/components/KapitalResults.tsx

import { useState } from "react";
import { KapitalResultadosSection } from "./KapitalResultadosSection";
import { KapitalAnalisisSection } from "./KapitalAnalisisSection";
import { KapitalMetodologiaSection } from "./MethodologyView";
import { LoadingOverlay } from "@/shared/components/common/LoadingOverlay";
import type { Results, SensibilizacionEntry } from "../KapitalPage";

export interface KapitalResultsProps {
  section: "result" | "analysis" | "methodology";
  results: Results | null;
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
  methodologyCategories: MethodologyCategory[];
  showComparison: boolean;
  onToggleComparison: () => void;
  sensibilizaciones: SensibilizacionEntry[];
  onOpenReport?: () => void;
}

interface MethodologyItem {
  name: string;
  file: string;
}

interface MethodologyCategory {
  name: string;
  products: MethodologyItem[];
}

export const KapitalResults: React.FC<KapitalResultsProps> = ({
  section,
  results,
  showCompanyCard,
  resultCurrency,
  onResultCurrencyChange,
  analysisDC,
  analysisKd,
  analysisCurrency,
  onAnalysisDCChange,
  onAnalysisKdChange,
  onAnalysisCurrencyChange,
  onAnalysisSubmit,
  loading,
  showComparison,
  onToggleComparison,
  sensibilizaciones,
  //methodologyCategories,
}) => {
  const [isCategoriaOpen, setIsCategoriaOpen] = useState(false);
  const [isModuloOpen, setIsModuloOpen] = useState(false);
  const [selectedMetodologiaItem, setSelectedMetodologiaItem] = useState<
    "curso" | "mercado"
  >("curso");

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!results) {
    return null;
  }

  return (
    <div className="flex-12 flex flex-row w-full h-full p-6 lg:p-8 bg-[#f3f6f9]">
      <div className="flex-1 w-full mx-2">
        <div className="mx-auto flex w-full max-w-300 flex-col gap-6">
          {section === "result" && (
            <KapitalResultadosSection
              results={results}
              showCompanyCard={showCompanyCard}
              resultCurrency={resultCurrency}
              onResultCurrencyChange={onResultCurrencyChange}
            />
          )}
          {section === "analysis" && (
            <KapitalAnalisisSection
              results={results}
              showCompanyCard={showCompanyCard}
              resultCurrency={resultCurrency}
              onResultCurrencyChange={onResultCurrencyChange}
              analysisDC={analysisDC}
              analysisKd={analysisKd}
              analysisCurrency={analysisCurrency}
              onAnalysisDCChange={onAnalysisDCChange}
              onAnalysisKdChange={onAnalysisKdChange}
              onAnalysisCurrencyChange={onAnalysisCurrencyChange}
              onAnalysisSubmit={onAnalysisSubmit}
              loading={loading}
              showComparison={showComparison}
              onToggleComparison={onToggleComparison}
              sensibilizaciones={sensibilizaciones}
            />
          )}

          {section === "methodology" && (
            <KapitalMetodologiaSection
              selectedMetodologiaItem={selectedMetodologiaItem}
              isCategoriaOpen={isCategoriaOpen}
              isModuloOpen={isModuloOpen}
              onToggleCategoria={() => setIsCategoriaOpen((open) => !open)}
              onToggleModulo={() => setIsModuloOpen((open) => !open)}
              onSelectCurso={() => setSelectedMetodologiaItem("curso")}
              onSelectMercado={() => setSelectedMetodologiaItem("mercado")}
            />
          )}
        </div>
      </div>
      {/*section === "result" && (
        <aside className="hidden lg:flex shrink-0 w-40 xl:w-48 ml-8 items-center justify-center overflow-hidden">
          <img
            src="/images/side-proideas.jpeg"
            alt="Sidebar Proideas Reporte"
            onClick={onOpenReport}
            className="cursor-pointer rounded-xl h-full w-fit"
          />
        </aside>
      )*/}
    </div>
  );
};
