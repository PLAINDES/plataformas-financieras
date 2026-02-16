// features/finance/kapital/components/KapitalResults.tsx

import React from 'react';
import { BalanceSheetBlock } from './BalanceSheetBlock';
import { ResultCard } from './ResultCard';
import { MethodologyView } from './MethodologyView';
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

interface MethodologyItem {
  name: string;
  file: string;
}

interface MethodologyCategory {
  name: string;
  products: MethodologyItem[];
}

interface KapitalResultsProps {
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
  methodologyCategories
}) => {
  const formatterx100p = (value: number): string => `${(value * 100).toFixed(2)}%`;

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!results) {
    return null;
  }

  if (section === 'methodology') {
    return <MethodologyView categories={methodologyCategories} />;
  }

  if (section === 'analysis') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Sensibilidad de resultados</h1>
              <p className="text-gray-600">Análisis de la tasa de tu empresa</p>
            </div>
            {formData.typeId && (
              <select 
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={resultCurrency} 
                onChange={(e) => onResultCurrencyChange(e.target.value as any)}
              >
                <option value="pen">PEN</option>
                <option value="usd">USD</option>
              </select>
            )}
          </div>

          {/* Analysis Cards */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Empresa/Sector</h3>
                <button 
                  type="submit" 
                  form="formSector"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Calcular
                </button>
              </div>
              <div className="p-6">
                <form id="formSector" onSubmit={onAnalysisSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Relación D/C <span className="text-red-600">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 text-sm text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={analysisDC}
                      onChange={(e) => onAnalysisDCChange(e.target.value)}
                      placeholder="150" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Costo de Deuda (Kd) <span className="text-red-600">*</span>
                    </label>
                    <div className="flex gap-1">
                      <select 
                        className="w-28 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={analysisCurrency}
                        onChange={(e) => onAnalysisCurrencyChange(e.target.value)}
                        disabled={!formData.typeId}
                      >
                        <option value="Dólares">Dólares</option>
                        <option value="Soles">Soles</option>
                      </select>
                      <div className="flex-1 flex">
                        <input 
                          type="text" 
                          className="flex-1 px-1 py-2 text-sm text-center border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          value={analysisKd}
                          onChange={(e) => onAnalysisKdChange(e.target.value)}
                          required
                        />
                        <span className="inline-flex items-center px-2 text-xs font-bold text-gray-500 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Chart Card */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-base font-bold text-gray-900">Empresa/Sector</h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="flex items-center justify-center">
                    <BalanceSheetBlock 
                      koa={formatterx100p(results.koa)}
                      kd={formatterx100p(results.kd)}
                      ke={formatterx100p(results.ke)}
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-5xl font-black text-gray-900 mb-2">{formatterx100p(results.cppc)}</h2>
                    <span className="text-sm font-medium text-gray-600">CPPC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ResultCard icon="fa-solid fa-file-lines" title="CPPC" description="Costo Promedio Ponderado de Capital" value={formatterx100p(results.cppc)} />
            <ResultCard icon="fa-solid fa-pencil" title="Kd*(1-T)" description="Costo de Deuda Después de Impuestos" value={formatterx100p(results.kd)} />
            <ResultCard icon="fa-solid fa-chart-column" title="Ke" description="Costo de Capital Financiero" value={formatterx100p(results.ke)} />
            <ResultCard icon="fa-solid fa-signal" title="Koa" description="Costo de Capital Económico" value={formatterx100p(results.koa)} />
          </div>
        </div>
      </div>
    );
  }

  // RESULTS VIEW (section === 'result')
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Resultados generales</h1>
          <p className="text-gray-600">Comparación de resultados</p>
        </div>

        {formData.typeId ? (
          <>
            {/* Company + Markets View */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden ${resultCurrency === 'usd' ? 'border-orange-500' : 'border-green-500'}`}>
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">Empresa</h3>
                  <select 
                    className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={resultCurrency} 
                    onChange={(e) => onResultCurrencyChange(e.target.value as any)}
                  >
                    <option value="pen">PEN</option>
                    <option value="usd">USD</option>
                  </select>
                </div>
                <div className="py-8 text-center">
                  <h2 className="text-4xl font-black text-gray-900 mb-2">{formatterx100p(results.cppc)}</h2>
                  <span className="text-sm font-medium text-gray-600">CPPC</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-base font-bold text-gray-900">Mercado emergente</h3>
                </div>
                <div className="py-8 text-center">
                  <h2 className="text-4xl font-black text-gray-900 mb-2">{formatterx100p(results.emergent.cppc)}</h2>
                  <span className="text-sm font-medium text-gray-600">CPPC</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-base font-bold text-gray-900">Mercado desarrollado</h3>
                </div>
                <div className="py-8 text-center">
                  <h2 className="text-4xl font-black text-gray-900 mb-2">{formatterx100p(results.developed.cppc)}</h2>
                  <span className="text-sm font-medium text-gray-600">CPPC</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ResultCard icon="fa-solid fa-file-lines" title="CPPC" description="Costo Promedio Ponderado de Capital" value={formatterx100p(results.cppc)} />
              <ResultCard icon="fa-solid fa-pencil" title="Kd*(1-T)" description="Costo de Deuda Después de Impuestos" value={formatterx100p(results.kd)} />
              <ResultCard icon="fa-solid fa-chart-column" title="Ke" description="Costo de Capital Financiero" value={formatterx100p(results.ke)} />
              <ResultCard icon="fa-solid fa-signal" title="Koa" description="Costo de Capital Económico" value={formatterx100p(results.koa)} />
            </div>
          </>
        ) : (
          <>
            {/* Market Comparison View */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="grid lg:grid-cols-3">
                <div className="lg:col-span-2 border-r border-gray-200 p-8">
                  <h3 className="text-base font-bold text-gray-900 mb-6">Resultados del mercado emergente</h3>
                  <BalanceSheetBlock 
                    koa={formatterx100p(results.emergent.koa)}
                    kd={formatterx100p(results.emergent.kd)}
                    ke={formatterx100p(results.emergent.ke)}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="border-b border-gray-200 p-6 text-center bg-gray-50">
                    <h2 className="text-4xl font-black text-gray-900 mb-2">{formatterx100p(results.emergent.cppc)}</h2>
                    <span className="text-sm font-medium text-gray-600">Costo promedio de capital (CPPC)</span>
                  </div>
                  <div className="p-6 space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">{formatterx100p(results.emergent.kd)}</p>
                        <p className="text-xs text-gray-600">Costo de deuda después de impuestos (Kd*(1-T))</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">{formatterx100p(results.emergent.ke)}</p>
                        <p className="text-xs text-gray-600">Costo de capital financiero (Ke)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">{formatterx100p(results.emergent.koa)}</p>
                        <p className="text-xs text-gray-600">Costo de capital económico (Koa)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="grid lg:grid-cols-3">
                <div className="lg:col-span-2 border-r border-gray-200 p-8">
                  <h3 className="text-base font-bold text-gray-900 mb-6">Resultados del mercado desarrollado</h3>
                  <BalanceSheetBlock 
                    koa={formatterx100p(results.developed.koa)}
                    kd={formatterx100p(results.developed.kd)}
                    ke={formatterx100p(results.developed.ke)}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="border-b border-gray-200 p-6 text-center bg-gray-50">
                    <h2 className="text-4xl font-black text-gray-900 mb-2">{formatterx100p(results.developed.cppc)}</h2>
                    <span className="text-sm font-medium text-gray-600">Costo promedio de capital (CPPC)</span>
                  </div>
                  <div className="p-6 space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">{formatterx100p(results.developed.kd)}</p>
                        <p className="text-xs text-gray-600">Costo de deuda después de impuestos (Kd*(1-T))</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">{formatterx100p(results.developed.ke)}</p>
                        <p className="text-xs text-gray-600">Costo de capital financiero (Ke)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">{formatterx100p(results.developed.koa)}</p>
                        <p className="text-xs text-gray-600">Costo de capital económico (Koa)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};