// features/finance/kapital/components/KapitalResults.tsx

import { KapitalResultadosSection } from "./KapitalResultadosSection";
import { KapitalAnalisisSection } from "./KapitalAnalisisSection";
import { LoadingOverlay } from "@/shared/components/common/LoadingOverlay";
import type { Results, SensibilizacionEntry } from "../KapitalPage";

export interface KapitalResultsProps {
  section: "result" | "sensitivity";
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
  onToggleComparison: (show: boolean) => void;
  sensibilizaciones: SensibilizacionEntry[];
  onOpenReport?: () => void;
  onSensibilizaClick: () => void;
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
  onSensibilizaClick,
  onOpenReport,
}) => {
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
              onSensibilizaClick={onSensibilizaClick}
              onOpenReport={onOpenReport}
            />
          )}
          {section === "sensitivity" && (
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
              onOpenReport={onOpenReport}
            />
          )}
        </div>
      </div>
    </div>
  );
};
