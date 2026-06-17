// features/finance/kapital/components/KapitalResults.tsx

import { KapitalResultadosSection } from "./KapitalResultadosSection";
import { KapitalAnalisisSection } from "./KapitalAnalisisSection";
import { LoadingOverlay } from "@/shared/components/common/LoadingOverlay";
import type { Results, SensibilizacionEntry } from "../KapitalPage";

export interface KapitalResultsProps {
    section: "result" | "sensitivity";
    results: Results | null;
    selectedSector?: string | null;
    selectedSubsector?: string | null;
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
    localCurrency?: string;
    chatbotComponent?: React.ReactNode;
    shouldShowChatbot: boolean;
    onToggleForm: () => void;
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
    selectedSector,
    selectedSubsector,
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
    onOpenReport,
    localCurrency,
    shouldShowChatbot,
    onToggleForm,
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
                            selectedSector={selectedSector}
                            selectedSubsector={selectedSubsector}
                            showCompanyCard={showCompanyCard}
                            resultCurrency={resultCurrency}
                            onResultCurrencyChange={onResultCurrencyChange}
                            onOpenReport={onOpenReport}
                            localCurrency={localCurrency}
                            shouldShowChatbot={shouldShowChatbot}
                            onToggleForm={onToggleForm}
                        />
                    )}
                    {section === "sensitivity" && (
                        <KapitalAnalisisSection
                            results={results}
                            selectedSector={selectedSector}
                            selectedSubsector={selectedSubsector}
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
                            localCurrency={localCurrency}
                            shouldShowChatbot={shouldShowChatbot}
                            onToggleForm={onToggleForm}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
