// features/finance/kapital/components/KapitalResults.tsx

import React, { useState } from 'react';
import { KapitalResultadosSection } from './KapitalResultadosSection';
import { KapitalAnalisisSection } from './KapitalAnalisisSection';
import { KapitalMetodologiaSection } from './MethodologyView';
import { LoadingOverlay } from '@/shared/components/common/LoadingOverlay';


interface FormData {
  typeId: boolean;
  // ... otros campos
}

interface MarketResults {
  cppc: number;
  kd: number;
  ke: number;
  koa: number;
}

interface Results {
  cppc: number;
  kd: number;
  ke: number;
  koa: number;
  emergent: MarketResults;
  developed: MarketResults;
}

export interface KapitalResultsProps {
  section: 'result' | 'analysis' | 'methodology';
  results: Results | null;
  formData: FormData;
  resultCurrency: 'pen' | 'usd';
  onResultCurrencyChange: (currency: 'pen' | 'usd') => void;
  analysisDC: string;
  analysisKd: string;
  analysisCurrency: string;
  onAnalysisDCChange: (value: string) => void;
  onAnalysisKdChange: (value: string) => void;
  onAnalysisCurrencyChange: (value: string) => void;
  onAnalysisSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  methodologyCategories: MethodologyCategory[];
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
  formData,
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
  methodologyCategories,
}) => {
  const [isCategoriaOpen, setIsCategoriaOpen] = useState(false);
  const [isModuloOpen, setIsModuloOpen] = useState(false);
  const [selectedMetodologiaItem, setSelectedMetodologiaItem] = useState<'curso' | 'mercado'>('curso');

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!results) {
    return null;
  }

  return (
    <div className="flex-12 flex flex-col w-full h-full lg:pb-10 py-10 lg:pt-10 bg-[#f3f6f9] min-h-dvh">
      <div className="flex-1 w-full px-4 sm:px-8">
        <div className="mx-auto flex w-full max-w-300 flex-col gap-6">

          {section === 'result' && (
            <KapitalResultadosSection
              results={results}
              formData={formData}
              resultCurrency={resultCurrency}
              onResultCurrencyChange={onResultCurrencyChange}
            />
          )}

          {section === 'analysis' && (
            <KapitalAnalisisSection
              results={results}
              formData={formData}
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
            />
          )}

          {section === 'methodology' && (
            <KapitalMetodologiaSection
              selectedMetodologiaItem={selectedMetodologiaItem}
              isCategoriaOpen={isCategoriaOpen}
              isModuloOpen={isModuloOpen}
              onToggleCategoria={() => setIsCategoriaOpen(open => !open)}
              onToggleModulo={() => setIsModuloOpen(open => !open)}
              onSelectCurso={() => setSelectedMetodologiaItem('curso')}
              onSelectMercado={() => setSelectedMetodologiaItem('mercado')}
            />
          )}

        </div>
      </div>
    </div>
  );
};