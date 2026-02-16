import React from 'react';
import { FormField } from '../../shared/components/FormField';
import { FormSection } from '../../shared/components/FormSection';

interface FormSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  dates: string[];
  sectors: string[];
  instruments: string[];
  bonos: string[];
  countries: string[];
  currencies: string[];
  hasResults: boolean;
}


export const FormSidebar: React.FC<FormSidebarProps> = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSubmit,
  loading,
  dates,
  sectors,
  instruments,
  bonos,
  countries,
  currencies,
  hasResults
}) => {
  return (
    <>
      {/* Backdrop Overlay */}
      {isOpen && hasResults && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
        <form onSubmit={onSubmit} className="flex h-full flex-col">

        <div className="flex-1 bg-white p-2">
   
          {/* Form Content */}
          <div className='overflow-auto pb-6'>
            
              {/* Section 1: Industry */}
              <FormSection title="Inputs de la industria" step={1}>
                <div className='flex gap-4 flex-col pt-6'>
                <FormField 
                  label="Fecha" 
                  name="date" 
                  type="select" 
                  value={formData.date} 
                  onChange={onInputChange} 
                  options={dates} 
                  required 
                />
                <FormField 
                  label="Industria" 
                  name="sector" 
                  type="select" 
                  value={formData.sector} 
                  onChange={onInputChange} 
                  options={sectors} 
                  required 
                />
                <FormField 
                  label="Tasa libre de riesgo" 
                  name="instrument" 
                  type="select" 
                  value={formData.instrument} 
                  onChange={onInputChange} 
                  options={instruments} 
                  required 
                />
                <FormField 
                  label="Año del bono" 
                  name="bono" 
                  type="select" 
                  value={formData.bono} 
                  onChange={onInputChange} 
                  options={bonos} 
                  required 
                />
                </div>
              </FormSection>

              {/* Section 2: Sector */}
              <FormSection title="Inputs del sector" step={2}>
                <div className='flex gap-4 flex-col pt-6'>
                <FormField 
                  label="País" 
                  name="country" 
                  type="select" 
                  value={formData.country} 
                  onChange={onInputChange} 
                  options={countries} 
                  required 
                />
                <FormField 
                  label="Devaluación" 
                  name="devaluation" 
                  value={formData.devaluation} 
                  onChange={onInputChange} 
                  suffix="%" 
                />
                <FormField 
                  label="Tasa impositiva" 
                  name="tax" 
                  value={formData.tax} 
                  onChange={onInputChange} 
                  suffix="%" 
                />
                </div>
              </FormSection>

              {/* Section 3: Company */}
              <FormSection 
                title="Inputs de su empresa" 
                step={3}
                subtitle="En caso no posea estos datos puede eliminarlos"
                toggle={formData.typeId}
                onToggle={() => {
                  const event = {
                    target: { name: 'typeId', value: !formData.typeId }
                  } as any;
                  onInputChange(event);
                }}
              >
                <div className="space-y-4">
                  {/* Costo de deuda con selector de moneda */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Costo de deuda
                    </label>
                    <div className="flex gap-2">
                      <select 
                        className="w-24 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        name="currency" 
                        value={formData.currency} 
                        onChange={onInputChange}
                      >
                        {currencies.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <div className="flex-1 flex">
                        <input 
                          type="text" 
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                          name="kd" 
                          placeholder="Escriba su Kd" 
                          value={formData.kd} 
                          onChange={onInputChange} 
                          required={formData.typeId}
                        />
                        <span className="inline-flex items-center px-3 text-xs font-bold text-gray-500 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <FormField 
                    label="% de deuda" 
                    name="debt" 
                    value={formData.debt} 
                    onChange={onInputChange} 
                    suffix="%" 
                    required={formData.typeId} 
                  />
                  <FormField 
                    label="% de capital" 
                    name="capital" 
                    value={formData.capital} 
                    onChange={onInputChange} 
                    suffix="%" 
                    required={formData.typeId} 
                    readOnly 
                  />
                </div>
              </FormSection>

              {/* Section 4: Financial Data */}
              <FormSection 
                title="Datos financieros optimizados" 
                step={4}
                subtitle="Datos que pueden ser completados automáticamente por el asistente IA"
                toggle={formData.useFinancialData}
                onToggle={() => {
                  const event = {
                    target: { name: 'useFinancialData', value: !formData.useFinancialData }
                  } as any;
                  onInputChange(event);
                }}
              >
                <div className="space-y-4">
                  {/* Info Alert */}
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      <strong>Sugerencia:</strong> Use el chatbot de análisis financiero para obtener estos datos automáticamente.
                    </p>
                  </div>

                  <FormField 
                    label="D/C Ratio" 
                    name="dc_ratio" 
                    value={formData.dc_ratio} 
                    onChange={onInputChange} 
                    suffix="decimal" 
                    placeholder="Ej: 0.35" 
                    tooltip="Ratio Deuda/Capital" 
                  />
                  <FormField 
                    label="Tasa Efectiva Impuesto" 
                    name="effective_tax_rate" 
                    value={formData.effective_tax_rate} 
                    onChange={onInputChange} 
                    suffix="%" 
                    placeholder="Ej: 25.5" 
                    tooltip="Tasa real de impuestos" 
                  />
                  <FormField 
                    label="Beta Apalancado" 
                    name="beta_levered" 
                    value={formData.beta_levered} 
                    onChange={onInputChange} 
                    suffix="coef." 
                    placeholder="Ej: 1.25" 
                    tooltip="Beta con riesgo financiero" 
                  />
                  <FormField 
                    label="Beta Desapalancado" 
                    name="beta_unlevered" 
                    value={formData.beta_unlevered} 
                    onChange={onInputChange} 
                    suffix="coef." 
                    placeholder="Ej: 0.95" 
                    tooltip="Beta sin riesgo financiero" 
                  />
                </div>
              </FormSection>
          </div>

          {/* Footer - Submit Button */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            <button 
              type="submit" 
              form="wacc-form"
              onClick={onSubmit}
              disabled={loading}
              className={`
                w-full py-3 px-6 rounded-lg font-bold text-sm transition-all duration-200
                ${loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl active:scale-95'}
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Calculando...
                </span>
              ) : (
                'CALCULA TU WACC'
              )}
            </button>
          </div>
        </div>
        </form>
    </>
  );
};