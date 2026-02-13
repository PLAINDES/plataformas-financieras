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
    <div className="methodology-container">
      <div className="bs-container-title mb-3">
        <div className="row">
          <div className="col-lg-12">
            <div>
              <h1 className="fs-4 mb-1">Metodología Valora</h1>
              <span className="fs-6 text-muted">Aprende con nosotros paso a paso</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Viewer Container */}
        <div className="col-lg-9 mb-3">
          <div className="card shadow-sm methodology-viewer">
            <div className="card-body p-0">
              {selectedFile ? (
                <iframe
                  src={selectedFile}
                  width="100%"
                  style={{ minHeight: '520px', height: 'calc(100vh - 200px)', border: 'none' }}
                  title={selectedFileName}
                  allowFullScreen
                />
              ) : (
                <div className="empty-viewer">
                  <i className="fa-solid fa-chalkboard-user text-primary mb-3" style={{ fontSize: '4rem' }} />
                  <h3 className="fs-5 text-muted">Selecciona un curso para visualizar</h3>
                  <p className="fs-7 text-muted">Elige un tema del menú lateral para comenzar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar with Categories */}
        <div className="col-lg-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-header bg-primary py-2">
              <h3 className="card-title text-white fs-6 mb-0">
                Aprende más sobre el costo del capital
              </h3>
            </div>
            <div className="card-body p-0">
              {categories && categories.length > 0 ? (
                <div className="accordion" id="methodologyAccordion">
                  {categories.map((category, index) => (
                    <div className="accordion-item" key={index}>
                      <h2 className="accordion-header" id={`heading-${index}`}>
                        <button
                          className={`accordion-button ${expandedIndex === index ? '' : 'collapsed'}`}
                          type="button"
                          onClick={() => toggleAccordion(index)}
                          aria-expanded={expandedIndex === index}
                          aria-controls={`collapse-${index}`}
                        >
                          {category.name}
                        </button>
                      </h2>
                      <div
                        id={`collapse-${index}`}
                        className={`accordion-collapse collapse ${expandedIndex === index ? 'show' : ''}`}
                        aria-labelledby={`heading-${index}`}
                      >
                        <div className="accordion-body py-2">
                          {category.products && category.products.length > 0 ? (
                            category.products.map((item, itemIndex) => (
                              <div
                                key={itemIndex}
                                className="methodology-item cursor-pointer my-2 p-2"
                                onClick={() => handleFileClick(item.file, item.name)}
                              >
                                <span className="fs-7">{item.name}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted fs-8 mb-0">No hay documentos disponibles</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-muted fs-7 mb-0">No hay datos para mostrar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};