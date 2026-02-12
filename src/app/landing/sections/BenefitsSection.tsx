// src/app/landing/sections/BenefitsSection.tsx

import { useState, useEffect, useRef } from 'react';
import type { BenefitsContent } from '../../../types/landing.types';
import type { EditableContent } from '../../../types/editable.types';
import { EditableText } from '../../../components/editable/EditableText';

interface BenefitsSectionProps {
  content: BenefitsContent;
  onSave: (content: EditableContent) => Promise<void>;
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

export function BenefitsSection({content, onSave}: BenefitsSectionProps) {
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
      <div className="bs-landing-section bs-section-1 py-5 sm:py-[30px] lg:py-10" id="beneficios">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-full lg:w-2/3">
              
              {/* Header */}
              <div className="text-center m-4 mb-7">
                <EditableText 
                  content={{ value: content.title, id: 'title', type: 'text', section: 'benefits' }}
                  onSave={onSave} 
                  as="h3" 
                  className="fw-semibold mb-3 text-2xl" 
                />

                <EditableText 
                  content={{ value: content.subtitle, id: 'subtitle', type: 'text', section: 'benefits' }}
                  onSave={onSave} 
                  as="h3" 
                  className="opacity-50 text-sm md:text-2xl px-3 py-1" 
                />
              </div>

              {/* Card with Chart */}
              <div className="bg-white rounded-lg shadow">
                <div className="relative p-6 sm:p-4 min-h-[500px] sm:min-h-[400px]">
                  
                  {/* Loading Overlay */}
                  {loading && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white/75 z-10">
                      <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] mb-3" role="status">
                          <span className="sr-only">Cargando...</span>
                        </div>
                        <p className="text-gray-500">Cargando...</p>
                      </div>
                    </div>
                  )}

                  {/* Filters Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                    <div className="w-full">
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={selectedIndustry}
                        onChange={handleIndustryChange}
                      >
                        <option value="" hidden>SELECCIONE UNA INDUSTRIA</option>
                        {industries.map((industry, index) => (
                          <option key={index} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full">
                      <div className="flex gap-2">
                        <select 
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          className="btn btn-outline py-1 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          onClick={handleSortToggle}
                          title={sortAscending ? 'Ordenar descendente' : 'Ordenar ascendente'}
                        >
                          <i className={`fa-solid ${sortAscending ? 'fa-arrow-down-1-9' : 'fa-arrow-up-1-9'} text-2xl`}></i>
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline py-1 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          onClick={handleZoomClick}
                          title="Ver en pantalla completa"
                        >
                          <i className="fa-solid fa-up-right-and-down-left-from-center text-2xl"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Chart Container */}
                  <div className="w-full">
                    <div className="w-full">
                      <div 
                        ref={chartRef}
                        className="w-full h-[420px]"
                      >
                        {!selectedIndustry || !selectedYear ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                              <i className="fa-solid fa-chart-column text-4xl mb-3 block"></i>
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
            className="fixed inset-0 bg-black/50 z-[1040]"
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div 
            className="fixed inset-0 block z-[1050]" 
            tabIndex={-1}
          >
            <div className="flex items-center justify-center min-h-screen w-screen h-screen">
              <div className="bg-white w-full h-full flex flex-col">
                
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-200">
                  <div>
                    <h3 className="font-bold mb-1 text-3xl md:text-4xl sm:text-xl">
                      ¿Qué tan riesgosa es su industria?
                    </h3>
                    <p className="opacity-50 text-lg md:text-2xl mb-0 sm:text-sm">
                      Revise el riesgo en el que se encuentra su empresa
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-icon btn-sm btn-active-light-primary ml-2 p-2 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  >
                    <i className="fa-solid fa-xmark text-3xl"></i>
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 overflow-y-auto relative">
                  {loading && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white/75 z-10">
                      <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] mb-3" role="status">
                          <span className="sr-only">Cargando...</span>
                        </div>
                        <p className="text-gray-500">Cargando...</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
                    <div className="lg:col-span-8">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                        <div className="lg:col-span-8">
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedIndustry}
                            onChange={handleIndustryChange}
                          >
                            <option value="" hidden>SELECCIONE UNA INDUSTRIA</option>
                            {industries.map((industry, index) => (
                              <option key={index} value={industry}>{industry}</option>
                            ))}
                          </select>
                        </div>
                        <div className="lg:col-span-4">
                          <div className="flex gap-2">
                            <select 
                              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                              className="btn btn-outline py-1 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              onClick={handleSortToggle}
                            >
                              <i className={`fa-solid ${sortAscending ? 'fa-arrow-down-1-9' : 'fa-arrow-up-1-9'} text-2xl`}></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedIndustryData && (
                      <div className="lg:col-span-4">
                        <h3 className="opacity-50 text-lg md:text-2xl mb-2">
                          Costo económico de la industria seleccionada
                        </h3>
                        <div className="flex items-center gap-3">
                          <h1 className="mb-0 text-4xl">{selectedIndustryData.value.toFixed(2)}%</h1>
                          <h3 className="text-blue-600 mb-0 mt-1 text-2xl">{selectedIndustryData.label}</h3>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <div className="w-full">
                      <div 
                        ref={chartModalRef}
                        className="w-full h-[620px]"
                      >
                        {!selectedIndustry || !selectedYear ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                              <i className="fa-solid fa-chart-column text-4xl mb-3 block"></i>
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
                <div className="p-6 border-t border-gray-200">
                  <button 
                    type="button" 
                    className="btn btn-light px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
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
    <div className="w-full h-full flex flex-col justify-end p-5">
      <div className="flex items-end justify-between gap-2 h-full">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const isSelected = item.industry === selectedIndustry;
          
          return (
            <div 
              key={index}
              className="flex flex-col items-center justify-end flex-grow h-full min-w-[40px]"
            >
              {/* Value Label */}
              <div 
                className="text-center mb-2 text-xs"
                style={{ 
                  fontWeight: isSelected ? 'bold' : 'normal',
                  color: isSelected ? '#0d6efd' : '#6c757d'
                }}
              >
                {item.value.toFixed(1)}%
              </div>
              
              {/* Bar */}
              <div 
                className="w-full rounded-t relative transition-all duration-300 ease-in-out min-h-[10px]"
                style={{ 
                  height: `${barHeight}%`,
                  backgroundColor: isSelected ? '#0d6efd' : '#e9ecef',
                  boxShadow: isSelected ? '0 4px 8px rgba(13, 110, 253, 0.3)' : 'none'
                }}
              />
              
              {/* Industry Label */}
              <div 
                className="text-center mt-2 whitespace-nowrap"
                style={{ 
                  fontSize: '0.7rem',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  color: isSelected ? '#0d6efd' : '#6c757d',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'top center',
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