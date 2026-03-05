import React, { useEffect, useRef, useState } from 'react';

interface ReportViewProps {
  reportUrl: string;
  reportId: string;
}

export const ReportView: React.FC<ReportViewProps> = ({ reportUrl, reportId }) => {
  const [panelHeight, setPanelHeight] = useState(580);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    startY.current = e.clientY;
    startHeight.current = panelHeight;
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const deltaY = e.clientY - startY.current;
      const newHeight = startHeight.current + deltaY;
      
      // Limites: min 300px, max alto de pantalla menos margen
      if (newHeight >= 300 && newHeight <= window.innerHeight - 150) {
        setPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-500">
      {/* Header del reporte */}
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Reporte generado</h1>
        <p className="text-sm text-gray-500 font-medium">Vista previa interactiva del reporte</p>
      </div>

      <div className="relative group">
        {/* Card Contenedora */}
        <div className={`
          bg-white border border-gray-200 shadow-xl overflow-hidden transition-shadow duration-300
          ${isResizing ? 'shadow-2xl ring-2 ring-blue-500/20' : 'hover:shadow-lg'}
        `}>
          <div 
            ref={panelRef}
            className="relative bg-gray-50"
            style={{ height: `${panelHeight}px` }}
          >
            <iframe 
              className="w-full h-full border-none bg-white"
              src={reportUrl}
              title={`Reporte ${reportId}`}
              allowFullScreen
            />
            
            {/* Indicador visual de redimensión (Handle central) */}
            <div 
              className={`
                absolute bottom-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-t-lg border border-b-0 border-gray-200 bg-white shadow-sm transition-all
                ${isResizing ? 'bg-blue-600 text-white' : 'text-gray-400 group-hover:text-gray-600'}
              `}
            >
              <i className="fa-solid fa-ellipsis text-[10px]"></i>
            </div>
          </div>

          {/* Área interactiva del Splitter */}
          <div 
            className={`
              h-2 w-full cursor-ns-resize transition-colors relative z-10
              ${isResizing ? 'bg-blue-600' : 'bg-gray-200 hover:bg-blue-400'}
            `}
            onMouseDown={handleMouseDown}
          >
            {/* Halo de interacción */}
            <div className="absolute inset-0 -top-2 -bottom-2" />
          </div>
        </div>
        
        {/* Nota informativa debajo del splitter */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
          <i className="fa-solid fa-arrows-up-down"></i>
          <span>Arrastra para ajustar el tamaño de la vista</span>
        </div>
      </div>
    </div>
  );
};