import React from 'react';

export const FormInput: React.FC<{
  label: string;
  name: string;
  type?: 'text' | 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: string[];
  suffix?: string;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  tooltip?: string;
}> = ({ label, name, type = 'text', value, onChange, options, suffix, required, readOnly, placeholder, tooltip }) => {
  
  // Mapeo de descripciones para ayuda visual (Helper Text)
  const helperTexts: Record<string, string> = {
    dc_ratio: "Ingrese como decimal (ej: 0.35 para 35%)",
    effective_tax_rate: "Tasa efectiva real de impuestos de la empresa",
    beta_levered: "Beta que refleja el riesgo financiero y operativo",
    beta_unlevered: "Beta sin riesgo financiero, solo riesgo del negocio"
  };

  const hasHelperText = helperTexts[name];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-4 items-center">
      {/* Label Section */}
      <label className="lg:col-span-4 flex items-center text-sm font-semibold text-gray-700">
        {label}
        {tooltip && (
          <span className="ml-1.5 group relative cursor-help">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {/* Tooltip moderno al estilo Tailwind */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-[11px] rounded shadow-lg z-20 leading-tight">
              {tooltip}
            </div>
          </span>
        )}
      </label>

      {/* Input Section */}
      <div className="lg:col-span-8 flex flex-col">
        <div className={`relative flex items-stretch w-full ${suffix ? 'shadow-sm' : ''}`}>
          {type === 'select' ? (
            <select 
              name={name} 
              value={value} 
              onChange={onChange} 
              required={required}
              className={`
                w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all
                ${suffix ? 'rounded-r-none' : ''}
                ${readOnly ? 'bg-gray-50' : 'bg-transparent'}
              `}
            >
              <option value="">SELECCIONE</option>
              {options?.map(item => (
                <option key={item} value={item} className="font-normal">{item}</option>
              ))}
            </select>
          ) : (
            <input 
              type="text" 
              name={name} 
              value={value} 
              onChange={onChange} 
              required={required}
              readOnly={readOnly}
              placeholder={placeholder}
              className={`
                w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all
                ${suffix ? 'rounded-r-none' : ''}
                ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'bg-white'}
              `}
            />
          )}
          
          {suffix && (
            <span className="inline-flex items-center px-3 text-xs font-bold text-gray-500 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg">
              {suffix}
            </span>
          )}
        </div>

        {/* Helper Text */}
        {hasHelperText && (
          <span className="mt-1 text-[11px] text-gray-400 font-medium leading-tight px-1">
            {helperTexts[name]}
          </span>
        )}
      </div>
    </div>
  );
};