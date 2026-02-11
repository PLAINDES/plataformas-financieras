import React, { useState } from 'react';

interface ReportDesign {
  id: string;
  name: string;
  content_id: string;
}

interface ReportContent {
  id: string;
  name: string;
  edit: number;
}

interface ReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateReport: (reportId: string, contentIds: string[]) => void;
  designs: ReportDesign[];
  contents: ReportContent[];
}

export const ReportDrawer: React.FC<ReportDrawerProps> = ({
  isOpen,
  onClose,
  onGenerateReport,
  designs,
  contents
}) => {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [selectedContents, setSelectedContents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);

  const handleReportChange = (reportId: string, contentId: string) => {
    setSelectedReport(reportId);
    
    // Filter contents based on selected report's content_id
    const reportContents = contents.filter(c => c.edit === 0 || contentId === c.id);
    const defaultSelected = reportContents.filter(c => c.edit === 0).map(c => c.id);
    setSelectedContents(defaultSelected);
  };

  const handleContentToggle = (contentId: string) => {
    setSelectedContents(prev => {
      if (prev.includes(contentId)) {
        return prev.filter(id => id !== contentId);
      } else {
        return [...prev, contentId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReport) {
      setLoading(true);
      onGenerateReport(selectedReport, selectedContents);
      onClose();
    }
  };


const displayedContents = contents.filter(c => {
  if (c.edit === 0) return true;
  return true;
});





  return (
    <>
      {/* Drawer */}
      <div 
        className={`report-drawer bg-body ${isOpen ? 'drawer-open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '600px',
          maxWidth: '100%',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          zIndex: 1060,
          boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
          overflowY: 'auto'
        }}
      >
        <div className="card shadow-none border-0 rounded-0 h-100">
          {/* Header */}
          <div className="card-header">
            <h3 className="card-title fw-bold text-dark"></h3>
            <div className="card-toolbar text-end">
              <button 
                type="button" 
                className="btn btn-sm btn-icon btn-active-light-primary me-n5"
                onClick={onClose}
              >
                <span className="svg-icon svg-icon-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect opacity="0.5" x="6" y="17.3137" width="16" height="2" rx="1" transform="rotate(-45 6 17.3137)" fill="currentColor" />
                    <rect x="7.41422" y="6" width="16" height="2" rx="1" transform="rotate(45 7.41422 6)" fill="currentColor" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="card-body position-relative">
            <div className="position-relative scroll-y me-n5 pe-5">
              <div className="d-flex justify-content-center">
                <div className="col-lg-11">
                  <div className="row">
                    <div className="col-lg-12">
                      <h2 className="mb-3 fs-4">Genera un reporte con tus datos</h2>
                      <div className="mb-10 fs-7 mb-4">
                        Identifica el costo de capital al que se enfrenta tu empresa, proyecto o inversión.
                      </div>
                    </div>

                    <div className="col-lg-12">
                      {loading && (
                        <div className="table-loading">
                          <div className="table-loading-message">Cargando...</div>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} id="formReportKapital">
                        <h4 className="mb-5 fs-5">Seleccione el producto de su preferencia:</h4>
                        <div className="row mb-10 d-inline-flex">
                          {designs.map((item, index) => (
                            <div className="col py-1" key={index}>
                              <input 
                                className="opacity-0 bs-check-1 check-report position-absolute" 
                                name="report" 
                                id={`check${index}`} 
                                type="radio" 
                                value={item.id}
                                onChange={() => handleReportChange(item.id, item.content_id)}
                                required
                              />
                              <label 
                                className="card bs-card-rp1 bs-card-report cursor-pointer" 
                                htmlFor={`check${index}`}
                                style={{ maxWidth: '150px' }}
                                title={item.name}
                              >
                                <div className="card-body">
                                  <div className="card-icon">
                                    <i className="fa-solid fa-laptop" style={{ fontSize: '1.4rem' }}></i>
                                  </div>
                                  <span className="card-text fs-7">
                                    {item.name.substring(0, 30)}
                                  </span>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </form>
                    </div>

                    <div className="col-lg-12">
                      <h3 className="mb-10 pt-4 pb-2 fs-6">Contenido:</h3>
                      
                      {displayedContents.map((item, index) => (
                        <div className="mb-2" key={index}>
                          <div className="form-check">
                            {item.edit === 0 ? (
                              <>
                                <i className="fa-solid fa-square-check checkform fs-5 me-2 "></i>
                                <span className="fs-7">{item.name}</span>
                                
                              </>
                            ) : (
                              <>
                                <input 
                                  type="checkbox" 
                                  className="me-2 ms-1 form-check-input" 
                                  style={{ transform: 'scale(1.4)' }}
                                  value={item.id}
                                  checked={selectedContents.includes(item.id)}
                                  onChange={() => handleContentToggle(item.id)}
                                />
                                <span className="fs-7">{item.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="col-lg-12">
                      <div className="d-flex justify-content-center mt-15">
                        <div className="col-lg-9">
                          <button 
                            type="submit" 
                            className="btn btn-primary w-100 mb-4" 
                            form="formReportKapital"
                            disabled={!selectedReport}
                          >
                            GENERAR REPORTE
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-light w-100 mb-4"
                            onClick={() => setShowConsultModal(true)}
                          >
                            COTIZAR CONSULTORÍA
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="drawer-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.30)',
            zIndex: 1059
          }}
        />
      )}

      {/* Consult Modal */}
      {showConsultModal && (
        <ConsultModal 
          isOpen={showConsultModal}
          onClose={() => setShowConsultModal(false)}
        />
      )}
    </>
  );
};

// Consult Modal Component
interface ConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConsultModal: React.FC<ConsultModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Consult form submitted:', formData);
    alert('Mensaje enviado correctamente');
    onClose();
  };

  return (
    <div 
      className={`modal fade ${isOpen ? 'show d-block' : ''}`}
      tabIndex={-1}
      style={{ backgroundColor: isOpen ? 'rgba(0,0,0,0.25)' : undefined, zIndex: 1070 }}
    >
      <div className="modal-dialog modal-md">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title fs-6 ">COTIZAR CONSULTORÍA</h3>
            <div 
              className="btn btn-icon btn-sm btn-active-light-info ms-2" 
              onClick={onClose}
              style={{ cursor: 'pointer' }}
            >
              <i className="fa-solid fa-close text-info fs-3"></i>
            </div>
          </div>
          <div className="modal-body">
            <form id="formMessage" onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fs-7">Correo electrónico</label>
                <input 
                  type="email" 
                  className="form-control form-control-solid" 
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder=""
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label fs-7">Mensaje</label>
                <textarea 
                  className="form-control form-control-solid" 
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={5}
                  required
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button 
              className="btn btn-primary" 
              form="formMessage"
              type="submit"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};