// src/app/landing/sections/BenefitsSection.tsx

import { useState, useEffect, useRef } from 'react';
import type { BenefitsContent } from '../../../types/landing.types';

interface BenefitsSectionProps {
  content: BenefitsContent;
  isAdmin: boolean;
}

// Tipos para los datos del gráfico
interface IndustryData {
  industry: string;
  value: number;
  label: string;
}

interface YearOption {
  year: number;
}

export function BenefitsSection({}: BenefitsSectionProps) {
  // Estados para los filtros
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [sortAscending, setSortAscending] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Datos de ejemplo (en producción vendrían de una API)
  const [industries] = useState<string[]>([
    'Tecnología',
    'Finanzas',
    'Manufactura',
    'Comercio',
    'Servicios',
    'Construcción',
    'Agricultura',
    'Energía'
  ]);
  
  const [years] = useState<YearOption[]>([
    { year: 2024 },
    { year: 2023 },
    { year: 2022 },
    { year: 2021 },
    { year: 2020 }
  ]);

  const [industryData, setIndustryData] = useState<IndustryData[]>([]);
  const [selectedIndustryData, setSelectedIndustryData] = useState<IndustryData | null>(null);
  
  const chartRef = useRef<HTMLDivElement>(null);
  const chartModalRef = useRef<HTMLDivElement>(null);

  // Función para generar datos de ejemplo
  const generateIndustryData = (industry: string, year: number) => {
    const data: IndustryData[] = industries.map(ind => ({
      industry: ind,
      value: Math.random() * 15 + 5, // Valor entre 5% y 20%
      label: ind === industry ? 'Alto' : ['Alto', 'Medio', 'Bajo'][Math.floor(Math.random() * 3)]
    }));
    return sortAscending ? data.sort((a, b) => a.value - b.value) : data.sort((a, b) => b.value - a.value);
  };

  // Efecto para cargar datos cuando cambian los filtros
  useEffect(() => {
    if (selectedIndustry && selectedYear) {
      setLoading(true);
      setTimeout(() => {
        const data = generateIndustryData(selectedIndustry, Number(selectedYear));
        setIndustryData(data);
        const selected = data.find(d => d.industry === selectedIndustry);
        setSelectedIndustryData(selected || null);
        setLoading(false);
      }, 500);
    }
  }, [selectedIndustry, selectedYear, sortAscending]);

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIndustry(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
  };

  const handleSortToggle = () => {
    setSortAscending(!sortAscending);
  };

  const handleZoomClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Main Section */}
      <div className="bs-landing-section bs-section-1" id="beneficios" style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              
              {/* Header */}
              <div className="text-center m-4 mb-md-7">
                <h3 className="fw-semibold mb-3 fs-4">
                 {/*   {content.title || '¿Qué tan riesgosa es su industria?'}   */}
                  ¿Qué tan riesgosa es su industria?
                </h3>
                <p className="opacity-50 fs-6 fs-md-4 px-3 py-1">
              {/*     {content.subtitle || ''}  */}
                  Revise el riesgo en el que se encuentra su empresa
                </p>

              </div>

              {/* Card with Chart */}
              <div className="card">
                <div className="card-body position-relative" style={{ minHeight: '500px' }}>
                  
                  {/* Loading Overlay */}
                  {loading && (
                    <div 
                      className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" 
                      style={{ zIndex: 10 }}
                    >
                      <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="text-muted">Cargando...</p>
                      </div>
                    </div>
                  )}

                  {/* Filters Row */}
                  <div className="row g-3 mb-4">
                    <div className="col-12 col-lg-6">
                      <select 
                        className="form-select" 
                        value={selectedIndustry}
                        onChange={handleIndustryChange}
                      >
                        <option value="" hidden>SELECCIONE UNA INDUSTRIA</option>
                        {industries.map((industry, index) => (
                          <option key={index} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-lg-6">
                      <div className="d-flex gap-2">
                        <select 
                          className="form-select flex-grow-1" 
                          value={selectedYear}
                          onChange={handleYearChange}
                        >
                          <option value="" hidden>SELECCIONE AÑO</option>
                          {years.map((yearObj, index) => (
                            <option key={index} value={yearObj.year}>{yearObj.year}</option>
                          ))}
                        </select>
                        <button 
                          type="button" 
                          className="btn btn-outline py-1 px-3"
                          onClick={handleSortToggle}
                          title={sortAscending ? 'Ordenar descendente' : 'Ordenar ascendente'}
                        >
                          <i className={`fa-solid ${sortAscending ? 'fa-arrow-down-1-9' : 'fa-arrow-up-1-9'} fs-3`}></i>
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline py-1 px-3"
                          onClick={handleZoomClick}
                          title="Ver en pantalla completa"
                        >
                          <i className="fa-solid fa-up-right-and-down-left-from-center fs-3"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Chart Container */}
                  <div className="row">
                    <div className="col-12">
                      <div 
                        ref={chartRef}
                        style={{ width: '100%', height: '420px' }}
                      >
                        {!selectedIndustry || !selectedYear ? (
                          <div className="d-flex align-items-center justify-content-center h-100">
                            <div className="text-center text-muted">
                              <i className="fa-solid fa-chart-column fs-1 mb-3 d-block"></i>
                              <p className="mb-0">Seleccione una industria y año para ver el gráfico</p>
                            </div>
                          </div>
                        ) : (
                          <SimpleBarChart data={industryData} selectedIndustry={selectedIndustry} />
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Fullscreen */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="modal-backdrop fade show"
            onClick={handleCloseModal}
            style={{ zIndex: 1040 }}
          />

          {/* Modal */}
          <div 
            className="modal fade show d-block" 
            tabIndex={-1}
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-fullscreen">
              <div className="modal-content">
                
                {/* Header */}
                <div className="modal-header">
                  <div>
                    <h3 className="fw-bold mb-1 fs-2 fs-md-1">
                      ¿Qué tan riesgosa es su industria?
                    </h3>
                    <p className="opacity-50 fs-5 fs-md-3 mb-0">
                      Revise el riesgo en el que se encuentra su empresa
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  >
                    <i className="fa-solid fa-xmark fs-2"></i>
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body position-relative">
                  {loading && (
                    <div 
                      className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" 
                      style={{ zIndex: 10 }}
                    >
                      <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="text-muted">Cargando...</p>
                      </div>
                    </div>
                  )}

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-lg-8">
                      <div className="row g-3">
                        <div className="col-12 col-lg-8">
                          <select 
                            className="form-select" 
                            value={selectedIndustry}
                            onChange={handleIndustryChange}
                          >
                            <option value="" hidden>SELECCIONE UNA INDUSTRIA</option>
                            {industries.map((industry, index) => (
                              <option key={index} value={industry}>{industry}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-12 col-lg-4">
                          <div className="d-flex gap-2">
                            <select 
                              className="form-select flex-grow-1" 
                              value={selectedYear}
                              onChange={handleYearChange}
                            >
                              <option value="" hidden>AÑO</option>
                              {years.map((yearObj, index) => (
                                <option key={index} value={yearObj.year}>{yearObj.year}</option>
                              ))}
                            </select>
                            <button 
                              type="button" 
                              className="btn btn-outline py-1 px-3"
                              onClick={handleSortToggle}
                            >
                              <i className={`fa-solid ${sortAscending ? 'fa-arrow-down-1-9' : 'fa-arrow-up-1-9'} fs-3`}></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedIndustryData && (
                      <div className="col-12 col-lg-4">
                        <h3 className="opacity-50 fs-5 fs-md-3 mb-2">
                          Costo económico de la industria seleccionada
                        </h3>
                        <div className="d-flex align-items-center gap-3">
                          <h1 className="mb-0 fs-1">{selectedIndustryData.value.toFixed(2)}%</h1>
                          <h3 className="text-primary mb-0 mt-1 fs-4">{selectedIndustryData.label}</h3>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-12">
                      <div 
                        ref={chartModalRef}
                        style={{ width: '100%', height: '620px' }}
                      >
                        {!selectedIndustry || !selectedYear ? (
                          <div className="d-flex align-items-center justify-content-center h-100">
                            <div className="text-center text-muted">
                              <i className="fa-solid fa-chart-column fs-1 mb-3 d-block"></i>
                              <p className="mb-0">Seleccione una industria y año para ver el gráfico</p>
                            </div>
                          </div>
                        ) : (
                          <SimpleBarChart data={industryData} selectedIndustry={selectedIndustry} height={620} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-light"
                    onClick={handleCloseModal}
                  >
                    Cerrar
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 991px) {
          .bs-section-1 {
            padding: 30px 0 !important;
          }
        }

        @media (max-width: 575px) {
          .bs-section-1 {
            padding: 20px 0 !important;
          }
          
          .card-body {
            padding: 1rem !important;
            min-height: 400px !important;
          }
          
          .modal-header h3 {
            font-size: 1.25rem !important;
          }
          
          .modal-header p {
            font-size: 0.875rem !important;
          }
        }
      `}</style>
    </>
  );
}

// Componente de gráfico de barras simple
interface SimpleBarChartProps {
  data: IndustryData[];
  selectedIndustry: string;
  height?: number;
}

function SimpleBarChart({ data, selectedIndustry, height = 420 }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="w-100 h-100 d-flex flex-column justify-content-end" style={{ padding: '20px' }}>
      <div className="d-flex align-items-end justify-content-between gap-2" style={{ height: '100%' }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const isSelected = item.industry === selectedIndustry;
          
          return (
            <div 
              key={index}
              className="d-flex flex-column align-items-center justify-content-end flex-grow-1"
              style={{ height: '100%', minWidth: '40px' }}
            >
              {/* Value Label */}
              <div 
                className="text-center mb-2"
                style={{ 
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  color: isSelected ? '#0d6efd' : '#6c757d'
                }}
              >
                {item.value.toFixed(1)}%
              </div>
              
              {/* Bar */}
              <div 
                className="w-100 rounded-top position-relative"
                style={{ 
                  height: `${barHeight}%`,
                  backgroundColor: isSelected ? '#0d6efd' : '#e9ecef',
                  transition: 'all 0.3s ease',
                  minHeight: '10px',
                  boxShadow: isSelected ? '0 4px 8px rgba(13, 110, 253, 0.3)' : 'none'
                }}
              />
              
              {/* Industry Label */}
              <div 
                className="text-center mt-2"
                style={{ 
                  fontSize: '0.7rem',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  color: isSelected ? '#0d6efd' : '#6c757d',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'top center',
                  whiteSpace: 'nowrap',
                  marginTop: '20px'
                }}
              >
                {item.industry}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}