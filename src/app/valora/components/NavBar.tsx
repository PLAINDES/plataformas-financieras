import React from 'react';

export const Navbar: React.FC<{
  uid?: string;
  selected: 'result' | 'analysis' | 'methodology' | '';
  onNavigate?: (view: 'result' | 'analysis' | 'methodology') => void;
  onOpenReport?: () => void;
}> = ({ uid, selected, onNavigate, onOpenReport }) => (
  <div className="navbar-actions d-flex align-items-center">
    {uid && (
      <>
        <div className="d-flex ms-3">
          <button 
            onClick={() => onNavigate?.('result')}
            className={`btn btn-flex flex-center bg-body btn-color-gray-700 btn-active-color-primary w-40px w-md-auto h-40px py-2 px-3 px-md-6 ${selected === 'result' ? 'active' : ''}`}
          >
            <span className="svg-icon svg-icon-2 svg-icon-primary me-0 me-md-2">
              <i className="fa-solid fa-square-poll-vertical"></i>
            </span>
            <span className="d-none d-md-inline">Resultados</span>
          </button>
        </div>
        <div className="d-flex ms-3 ">
          <button 
            onClick={() => onNavigate?.('analysis')}
            className={`btn btn-flex flex-center bg-body btn-color-gray-700 btn-active-color-primary w-40px w-md-auto h-40px py-2 px-3 px-md-6 ${selected === 'analysis' ? 'active' : ''}`}
          >
            <span className="svg-icon svg-icon-2 svg-icon-primary me-0 me-md-2">
              <i className="fa-solid fa-chart-line"></i>
            </span>
            <span className="d-none d-md-inline">Análisis</span>
          </button>
        </div>
        <div className="d-flex ms-3">
          <button 
            onClick={() => onNavigate?.('methodology')}
            className={`btn btn-flex flex-center bg-body btn-color-gray-700 btn-active-color-primary w-40px w-md-auto h-40px py-2 px-3 px-md-6 ${selected === 'methodology' ? 'active' : ''}`}
            style={{ background: 'transparent', border: '1px solid #e4e6ef' }}
          >
              <span className=" svg-icon-2 svg-icon-primary me-0 me-md-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity="0.3" d="M19 22H5C4.4 22 4 21.6 4 21V3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22ZM12.5 18C12.5 17.4 12.6 17.5 12 17.5H8.5C7.9 17.5 8 17.4 8 18C8 18.6 7.9 18.5 8.5 18.5L12 18C12.6 18 12.5 18.6 12.5 18ZM16.5 13C16.5 12.4 16.6 12.5 16 12.5H8.5C7.9 12.5 8 12.4 8 13C8 13.6 7.9 13.5 8.5 13.5H15.5C16.1 13.5 16.5 13.6 16.5 13ZM12.5 8C12.5 7.4 12.6 7.5 12 7.5H8C7.4 7.5 7.5 7.4 7.5 8C7.5 8.6 7.4 8.5 8 8.5H12C12.6 8.5 12.5 8.6 12.5 8Z" fill="currentColor" />
                  <rect x="7" y="17" width="6" height="2" rx="1" fill="currentColor" />
                  <rect x="7" y="12" width="10" height="2" rx="1" fill="currentColor" />
                  <rect x="7" y="7" width="6" height="2" rx="1" fill="currentColor" />
                  <path d="M15 8H20L14 2V7C14 7.6 14.4 8 15 8Z" fill="currentColor" />
                </svg>
              </span>
              <span className="d-none d-md-inline">Metodología</span>
     
          </button>
        </div>
        <div className="d-flex ms-3">
          <button 
            onClick={onOpenReport}
            className="btn btn-flex flex-center bg-body btn-color-primary w-40px w-md-auto h-40px py-2 px-3 px-md-6 active-report">
            <span className="
            svg-icon-2 svg-icon-primary me-0 me-md-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.3" d="M19 22H5C4.4 22 4 21.6 4 21V3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22ZM12.5 18C12.5 17.4 12.6 17.5 12 17.5H8.5C7.9 17.5 8 17.4 8 18C8 18.6 7.9 18.5 8.5 18.5L12 18C12.6 18 12.5 18.6 12.5 18ZM16.5 13C16.5 12.4 16.6 12.5 16 12.5H8.5C7.9 12.5 8 12.4 8 13C8 13.6 7.9 13.5 8.5 13.5H15.5C16.1 13.5 16.5 13.6 16.5 13ZM12.5 8C12.5 7.4 12.6 7.5 12 7.5H8C7.4 7.5 7.5 7.4 7.5 8C7.5 8.6 7.4 8.5 8 8.5H12C12.6 8.5 12.5 8.6 12.5 8Z" fill="currentColor" />
                <rect x="7" y="17" width="6" height="2" rx="1" fill="currentColor" />
                <rect x="7" y="12" width="10" height="2" rx="1" fill="currentColor" />
                <rect x="7" y="7" width="6" height="2" rx="1" fill="currentColor" />
                <path d="M15 8H20L14 2V7C14 7.6 14.4 8 15 8Z" fill="currentColor" />
              </svg>
            </span>
            <span className="d-none d-md-inline">Generar Reportes</span>
          </button>
        </div>
      </>
    )}
  </div>
);