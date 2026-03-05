// features/finance/kapital/components/KapitalAnalisisSection.tsx

import React from 'react';
import { BalanceSheetBlock } from './BalanceSheetBlock';
import { ResultCard } from './ResultCard';

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

interface FormData {
  typeId: boolean;
}

export interface KapitalAnalisisSectionProps {
  results: Results;
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
}

const formatterx100p = (value: number): string => `${(value * 100).toFixed(2)}%`;

export const KapitalAnalisisSection: React.FC<KapitalAnalisisSectionProps> = ({
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
}) => {
  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sensibilidad de resultados</h1>
          <p className="text-gray-600">Análisis de la tasa de tu empresa</p>
        </div>
        {formData.typeId && (
          <select
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={resultCurrency}
            onChange={(e) => onResultCurrencyChange(e.target.value as 'pen' | 'usd')}
          >
            <option value="pen">PEN</option>
            <option value="usd">USD</option>
          </select>
        )}
      </div>

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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ResultCard icon="fa-solid fa-file-lines" title="CPPC" description="Costo Promedio Ponderado de Capital" value={formatterx100p(results.cppc)} />
        <ResultCard icon="fa-solid fa-pencil" title="Kd*(1-T)" description="Costo de Deuda Después de Impuestos" value={formatterx100p(results.kd)} />
        <ResultCard icon="fa-solid fa-chart-column" title="Ke" description="Costo de Capital Financiero" value={formatterx100p(results.ke)} />
        <ResultCard icon="fa-solid fa-signal" title="Koa" description="Costo de Capital Económico" value={formatterx100p(results.koa)} />
      </div>
    </>
  );
};