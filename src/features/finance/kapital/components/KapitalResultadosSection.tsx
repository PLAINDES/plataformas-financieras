// features/finance/kapital/components/KapitalResultadosSection.tsx

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

export interface KapitalResultadosSectionProps {
  results: Results;
  formData: FormData;
  resultCurrency: 'pen' | 'usd';
  onResultCurrencyChange: (currency: 'pen' | 'usd') => void;
}

const formatterx100p = (value: number): string => `${(value * 100).toFixed(2)}%`;

const MarketDetailList: React.FC<{ market: MarketResults }> = ({ market }) => (
  <div className="p-6 space-y-4 flex-1">
    {[
      { value: market.kd, label: 'Costo de deuda después de impuestos (Kd*(1-T))', color: 'green' },
      { value: market.ke, label: 'Costo de capital financiero (Ke)', color: 'blue' },
      { value: market.koa, label: 'Costo de capital económico (Koa)', color: 'gray' },
    ].map(({ value, label, color }) => (
      <div key={label} className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
          <span className={`text-sm font-bold text-${color}-600`}>%</span>
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">{formatterx100p(value)}</p>
          <p className="text-xs text-gray-600">{label}</p>
        </div>
      </div>
    ))}
  </div>
);

export const KapitalResultadosSection: React.FC<KapitalResultadosSectionProps> = ({
  results,
  formData,
  resultCurrency,
  onResultCurrencyChange,
}) => {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Resultados generales</h1>
        <p className="text-gray-600">Comparación de resultados</p>
      </div>

      {formData.typeId ? (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden ${resultCurrency === 'usd' ? 'border-orange-500' : 'border-green-500'}`}>
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Empresa</h3>
                <select
                  className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={resultCurrency}
                  onChange={(e) => onResultCurrencyChange(e.target.value as 'pen' | 'usd')}
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

            {(['emergent', 'developed'] as const).map((market) => (
              <div key={market} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-base font-bold text-gray-900">
                    {market === 'emergent' ? 'Mercado emergente' : 'Mercado desarrollado'}
                  </h3>
                </div>
                <div className="py-8 text-center">
                  <h2 className="text-4xl font-black text-gray-900 mb-2">{formatterx100p(results[market].cppc)}</h2>
                  <span className="text-sm font-medium text-gray-600">CPPC</span>
                </div>
              </div>
            ))}
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
          {(['emergent', 'developed'] as const).map((market) => (
            <div key={market} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="grid lg:grid-cols-3">
                <div className="lg:col-span-2 border-r border-gray-200 p-8">
                  <h3 className="text-base font-bold text-gray-900 mb-6">
                    {market === 'emergent' ? 'Resultados del mercado emergente' : 'Resultados del mercado desarrollado'}
                  </h3>
                  <BalanceSheetBlock
                    koa={formatterx100p(results[market].koa)}
                    kd={formatterx100p(results[market].kd)}
                    ke={formatterx100p(results[market].ke)}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="border-b border-gray-200 p-6 text-center bg-gray-50">
                    <h2 className="text-4xl font-black text-gray-900 mb-2">{formatterx100p(results[market].cppc)}</h2>
                    <span className="text-sm font-medium text-gray-600">Costo promedio de capital (CPPC)</span>
                  </div>
                  <MarketDetailList market={results[market]} />
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
};