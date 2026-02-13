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
      
      // Set min and max heights
      if (newHeight >= 200 && newHeight <= window.innerHeight - 100) {
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
    <div className="report-view-container ">
      <div className="bs-container-title mb-3">
        <h1 className="fs-4 mb-1">Reporte generado</h1>
        <span className="fs-6 text-muted">Vista previa del reporte</span>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="card shadow-sm rounded-0">
            <div 
              ref={panelRef}
              className="panel-top position-relative"
              style={{ height: `${panelHeight}px` }}
            >
              <iframe 
                style={{ width: '100%', height: '100%', border: 'none' }}
                src={reportUrl}
                title={`Reporte ${reportId}`}
              />
              <div className="icon-splitter">
                <i className="fa-solid fa-bars fa-splitter"></i>
              </div>
            </div>
            <div 
              className="splitter-horizontal"
              onMouseDown={handleMouseDown}
              style={{ cursor: 'ns-resize' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};