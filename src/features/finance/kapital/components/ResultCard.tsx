import React from 'react';

export const ResultCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  value: string;
}> = ({ icon, title, description, value }) => (
  <div className="flex">
    <div className="group w-full bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
      {/* Header con Icono */}
      <div className="px-5 pt-5 pb-2">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white">
          <i className={`${icon} text-lg`} />
        </div>
      </div>

      {/* Cuerpo: Textos */}
      <div className="px-5 py-2 flex-1">
        <h3 className="text-sm font-bold text-gray-800 leading-tight mb-1">
          {title}
        </h3>
        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
          {description}
        </p>
      </div>

      {/* Footer: Valor principal */}
      <div className="px-5 py-4 mt-2 bg-gray-50/50 border-t border-gray-50">
        <div className="flex items-baseline gap-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {value}
          </h2>
          {/* Opcional: podrías añadir un indicador de tendencia aquí */}
        </div>
      </div>
    </div>
  </div>
);
