import React, { useState } from 'react';

// --- Interfaces (Se mantienen igual) ---
interface ReportDesign { id: string; name: string; content_id: string; }
interface ReportContent { id: string; name: string; edit: number; }
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
    const reportContents = contents.filter(c => c.edit === 0 || contentId === c.id);
    const defaultSelected = reportContents.filter(c => c.edit === 0).map(c => c.id);
    setSelectedContents(defaultSelected);
  };

  const handleContentToggle = (contentId: string) => {
    setSelectedContents(prev => 
      prev.includes(contentId) ? prev.filter(id => id !== contentId) : [...prev, contentId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReport) {
      setLoading(true);
      onGenerateReport(selectedReport, selectedContents);
      onClose();
    }
  };

  return (
    <>
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-[550px] bg-white z-[1060] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Configurar Reporte</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Genera un reporte con tus datos</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Identifica el costo de capital al que se enfrenta tu empresa, proyecto o inversión.
            </p>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-sm font-bold text-blue-600">Procesando...</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} id="formReportKapital">
            <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 tracking-wide">Seleccione el diseño:</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {designs.map((item, index) => (
                <div key={index} className="relative">
                  <input 
                    className="sr-only peer" 
                    name="report" 
                    id={`check${index}`} 
                    type="radio" 
                    value={item.id}
                    onChange={() => handleReportChange(item.id, item.content_id)}
                    required
                  />
                  <label 
                    className="block p-4 border-2 rounded-xl cursor-pointer transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50/50 hover:border-gray-300" 
                    htmlFor={`check${index}`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`mb-2 p-2 rounded-lg transition-colors ${selectedReport === item.id ? 'text-blue-600' : 'text-gray-400'}`}>
                        <i className="fa-solid fa-file-invoice" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <span className="text-xs font-bold text-gray-800 break-words leading-tight">
                        {item.name}
                      </span>
                    </div>
                  </label>
                  {selectedReport === item.id && (
                    <div className="absolute top-2 right-2 text-blue-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 tracking-wide border-t pt-6">Contenido incluido:</h3>
            <div className="space-y-3 mb-10">
              {contents.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-center p-3 rounded-lg transition-colors ${item.edit === 0 ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                  {item.edit === 0 ? (
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-circle-check text-blue-600 text-lg"></i>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">Requerido</span>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 cursor-pointer w-full text-sm font-medium text-gray-700">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all" 
                        value={item.id}
                        checked={selectedContents.includes(item.id)}
                        onChange={() => handleContentToggle(item.id)}
                      />
                      {item.name}
                    </label>
                  )}
                </div>
              ))}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex flex-col gap-3">
            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]" 
              form="formReportKapital"
              disabled={!selectedReport || loading}
            >
              GENERAR REPORTE COMPLETO
            </button>
            <button 
              type="button" 
              className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
              onClick={() => setShowConsultModal(true)}
            >
              COTIZAR CONSULTORÍA
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1059] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Modal */}
      {showConsultModal && (
        <ConsultModal 
          isOpen={showConsultModal}
          onClose={() => setShowConsultModal(false)}
        />
      )}
    </>
  );
};

// --- Consult Modal Component ---
const ConsultModal: React.FC<ConsultModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ email: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Mensaje enviado correctamente');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1070] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Cotizar Consultoría</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Correo electrónico</label>
            <input 
              type="email" 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none" 
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mensaje</label>
            <textarea 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none" 
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
            ENVIAR SOLICITUD
          </button>
        </form>
      </div>
    </div>
  );
};