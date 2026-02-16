import React, { useState } from 'react';

interface MethodologyItem {
  name: string;
  file: string;
}

interface MethodologyCategory {
  name: string;
  products: MethodologyItem[];
}

interface MethodologyViewProps {
  categories: MethodologyCategory[];
}

export const MethodologyView: React.FC<MethodologyViewProps> = ({ categories }) => {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const handleFileClick = (fileUrl: string, fileName: string) => {
    setSelectedFile(fileUrl);
    setSelectedFileName(fileName);
  };

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
          Metodología Kapital
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          Aprende con nosotros paso a paso
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Viewer Container (Lado Izquierdo) */}
        <div className="lg:col-span-9 order-2 lg:order-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[520px] h-[calc(100vh-250px)]">
            {selectedFile ? (
              <div className="h-full flex flex-col">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider truncate mr-4">
                    Visualizando: {selectedFileName}
                  </span>
                  <button 
                    onClick={() => { setSelectedFile(''); setSelectedFileName(''); }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <iframe
                  src={selectedFile}
                  className="w-full flex-1 border-none"
                  title={selectedFileName}
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Selecciona un curso para visualizar</h3>
                <p className="text-gray-500 max-w-xs text-sm">
                  Elige un tema del menú lateral para comenzar tu lección.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Lado Derecho) */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
            <div className="bg-blue-600 px-5 py-4">
              <h3 className="text-sm font-bold text-white leading-tight">
                Contenido del Curso
              </h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {categories && categories.length > 0 ? (
                categories.map((category, index) => (
                  <div key={index} className="flex flex-col">
                    {/* Accordion Trigger */}
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors group"
                    >
                      <span className={`text-sm font-bold transition-colors ${expandedIndex === index ? 'text-blue-600' : 'text-gray-700'}`}>
                        {category.name}
                      </span>
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedIndex === index ? 'rotate-180 text-blue-500' : ''}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Accordion Content */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50 ${
                        expandedIndex === index ? 'max-h-[500px] border-b border-gray-100' : 'max-h-0'
                      }`}
                    >
                      <div className="px-5 py-2 pb-4 space-y-1">
                        {category.products && category.products.length > 0 ? (
                          category.products.map((item, itemIndex) => (
                            <button
                              key={itemIndex}
                              onClick={() => handleFileClick(item.file, item.name)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 group ${
                                selectedFile === item.file 
                                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                                  : 'text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm'
                              }`}
                            >
                              <svg className={`w-3 h-3 ${selectedFile === item.file ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                              <span className="truncate">{item.name}</span>
                            </button>
                          ))
                        ) : (
                          <p className="text-[10px] text-gray-400 italic py-2">No hay documentos disponibles</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No hay datos para mostrar
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};