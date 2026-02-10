import React, { useEffect, useRef, useState } from 'react';
import { MainPage } from './MainPage';
import { ValoraMobileLayout } from './ValoraMobileLayout';
import { UploadTemplateModal } from './UploadTemplateModal';
import { ValoraResults } from './ValoraResults';
import { ValoraResultsTabs } from './ValoraResultsTabs';
import { ValoraDesktopHeader } from './ValoraDesktopHeader';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { ToastStack } from '../../components/common/ToastStack';
import type { FinancialTable, FormData } from '../../types/ValoraTypes';
import type { ToastType } from '../../types/toast.types';
import { MainPageFooter } from './MainPageFooter';
import { parseFinancialTablesFromFile } from './valoraFileParsing';
import { ReportProductCard } from './ReportProductCard';
import { ReportSidebar } from './ReportSidebar';

const ValoraPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    date: '',
    country: '',
    currency: '',
    sector: '',
    fileUsername: '',
    action: ''
  });
  const [width, setWidth] = useState(window.innerWidth);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [activePanel, setActivePanel] = useState<'menu' | 'form' | 'options' | null>(null);
  const [lastPanel, setLastPanel] = useState<'menu' | 'form' | 'options'>('menu');
  const [isDesktopFormOpen, setIsDesktopFormOpen] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; message: string }>>([]);
  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  const [resultsSection, setResultsSection] = useState<'estados' | 'resultados' | 'analisis' | 'metodologia'>('resultados');
  const [isReportSidebarOpen, setIsReportSidebarOpen] = useState(false);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [selectedReportProductId, setSelectedReportProductId] = useState('datos');
  const [balanceTable, setBalanceTable] = useState<FinancialTable | null>(null);
  const [resultsTable, setResultsTable] = useState<FinancialTable | null>(null);
  const currentMobilePage = showResults
    ? (
      <div className='flex flex-col'>
        {isReportViewerOpen ? (
          <section className="w-full px-4 pb-10 sm:px-8">
            <div className="mx-auto w-full max-w-5xl rounded-lg border border-gray-200 bg-white shadow">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h4 className="text-sm font-semibold text-gray-800">REPORTE DE DATOS</h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReportViewerClose}
                    className="rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600"
                  >
                    Salir
                  </button>
                  <a
                    href="/files/Reporte-Detallado.pdf"
                    download
                    className="rounded bg-[#009ef7] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Descargar
                  </a>
                </div>
              </div>
              <div className="h-[70vh] w-full">
                <iframe
                  title="Reporte de datos"
                  src="/files/Reporte-Detallado.pdf"
                  className="h-full w-full"
                />
              </div>
            </div>
          </section>
        ) : (
          <ValoraResults
            formData={formData}
            section={resultsSection}
            balanceTable={balanceTable}
            resultsTable={resultsTable}
          />
        )}
        <MainPageFooter />
      </div>
    )
    : <MainPage />;
  const headerRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sample data
  const dates = ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4'];
  const countries = ['Perú', 'Estados Unidos', 'Chile', 'Colombia', 'México'];
  const currencies = ['USD', 'PEN', 'EUR', 'CLP', 'COP', 'MXN'];
  const sectors = ['Tecnología', 'Finanzas', 'Manufactura', 'Servicios', 'Retail', 'Salud', 'Energía'];
  const reportProducts = [
    {
      id: 'datos',
      title: 'REPORTE DE DATOS',
      iconClassName: 'fa-solid fa-laptop text-2xl text-gray-400'
    },
    {
      id: 'especializado',
      title: 'REPORTE ESPECIALIZADO',
      iconClassName: 'fa-solid fa-laptop text-2xl text-gray-400'
    }
  ];

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  useEffect(() => () => {
    toastTimeoutsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId));
    toastTimeoutsRef.current.clear();
  }, []);

  useEffect(() => () => {
    if (uploadedFileUrl) {
      URL.revokeObjectURL(uploadedFileUrl);
    }
  }, [uploadedFileUrl]);

  const handleResultsSectionChange = (
    nextSection: 'estados' | 'resultados' | 'analisis' | 'metodologia'
  ) => {
    setResultsSection(nextSection);
    if (nextSection === 'metodologia' && isDesktopFormOpen) {
      setIsDesktopFormOpen(false);
    }
  };

  const handleReportSidebarOpen = () => {
    setIsReportSidebarOpen(true);
    setActivePanel(null);
    if (isDesktopFormOpen) {
      setIsDesktopFormOpen(false);
    }
  };

  const handleReportSidebarClose = () => {
    setIsReportSidebarOpen(false);
  };

  const handleReportViewerOpen = () => {
    setIsReportViewerOpen(true);
    setIsReportSidebarOpen(false);
  };

  function handleReportViewerClose() {
    setIsReportViewerOpen(false);
  }

  useEffect(() => {
    const headerEl = headerRef.current;
    const containerEl = containerRef.current;
    if (!headerEl || !containerEl) {
      return undefined;
    }

    const updateHeaderWidth = () => {
      containerEl.style.setProperty('--header-width', `${headerEl.offsetWidth}px`);
    };

    updateHeaderWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateHeaderWidth);
      return () => window.removeEventListener('resize', updateHeaderWidth);
    }

    const observer = new ResizeObserver(() => updateHeaderWidth());
    observer.observe(headerEl);

    return () => observer.disconnect();
  }, [isDesktopFormOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missingFields: string[] = [];

    if (!formData.date) {
      missingFields.push('Fecha');
    }
    if (!formData.country) {
      missingFields.push('Pais');
    }
    if (!formData.currency) {
      missingFields.push('Moneda');
    }
    if (!formData.sector) {
      missingFields.push('Sector');
    }
    if (!fileUploaded) {
      missingFields.push('Plantilla EEFF');
    }

    if (missingFields.length > 0) {
      addToast('warn', `Completa los campos: ${missingFields.join(', ')}`);
      return;
    }

    setShowResults(false);
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
      addToast('success', 'Resultados generados correctamente.');
    }, 1000);
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/files/PlantillaUsuarioValora.xlsx';
    link.download = 'PlantillaUsuarioValora.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openUploadTemplateModal = () => {
    setIsUploadModalOpen(true);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    const timeoutId = toastTimeoutsRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      toastTimeoutsRef.current.delete(id);
    }
  };

  const addToast = (type: ToastType, message: string) => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setToasts(prev => [...prev, { id, type, message }]);
    const timeoutId = window.setTimeout(() => removeToast(id), 3500);
    toastTimeoutsRef.current.set(id, timeoutId);
  };

  const handleUploadTemplate = (file: File) => {
    setUploadedFileUrl(prevUrl => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return URL.createObjectURL(file);
    });
    setFormData(prev => ({ ...prev, fileUsername: file.name }));
    setFileUploaded(true);
    setIsUploadModalOpen(false);
    addToast('success', 'Plantilla cargada en el formulario.');
    parseFinancialTables(file);
  };

  const handleClearUploadedFile = () => {
    setUploadedFileUrl(prevUrl => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return null;
    });
    setFormData(prev => ({ ...prev, fileUsername: '' }));
    setFileUploaded(false);
    setUploadResetKey(prev => prev + 1);
    setBalanceTable(null);
    setResultsTable(null);
    addToast('info', 'Archivo eliminado del formulario.');
  };

  const parseFinancialTables = async (file: File) => {
    try {
      const { balanceTable: parsedBalance, resultsTable: parsedResults } =
        await parseFinancialTablesFromFile(file);

      setBalanceTable(parsedBalance);
      setResultsTable(parsedResults);

      if (!parsedBalance && !parsedResults) {
        addToast('warn', 'No se encontraron las tablas en el archivo.');
      } else if (!parsedBalance) {
        addToast('warn', 'Falta la tabla: Balance General.');
      } else if (!parsedResults) {
        addToast('warn', 'Falta la tabla: Estado de Resultados.');
      }
    } catch (error) {
      console.error('Error parsing Excel:', error);
      addToast('error', 'No se pudo leer el archivo Excel.');
    }
  };

  const isMobileSize = () => {
    // return width <= 768;
    return width <= 1200;
  }

  const togglePanel = (panel: 'menu' | 'form' | 'options') => {
    setActivePanel(prev => (prev === panel ? null : panel));
    setLastPanel(panel);
  };

  return (
    <div className='h-dvh flex'>
      {
        !isMobileSize() ?
          <>
            <div
              className='relative h-dvh w-full'
              ref={containerRef}
              style={{ ['--header-width' as string]: '0px' }}
            >
              <ValoraDesktopHeader
                headerRef={headerRef}
                isDesktopFormOpen={isDesktopFormOpen}
                onToggleDesktopForm={() => setIsDesktopFormOpen(prev => !prev)}
                isFormToggleDisabled={resultsSection === 'metodologia' || isReportSidebarOpen}
                formData={formData}
                dates={dates}
                countries={countries}
                currencies={currencies}
                sectors={sectors}
                fileUploaded={fileUploaded}
                uploadedFileUrl={uploadedFileUrl}
                onClearUploadedFile={handleClearUploadedFile}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onDownloadTemplate={downloadTemplate}
                onUploadTemplate={openUploadTemplateModal}
              />
              <div className="w-full bg-white shadow-xs self-start md:min-h-17 fixed z-10 flex flex-row justify-end items-center pr-20">
                {showResults && (
                  <div className="flex items-center gap-4">
                    <ValoraResultsTabs
                      activeSection={resultsSection}
                      onChange={handleResultsSectionChange}
                    />
                    <button
                      type="button"
                      className="`border-[#7B1FA2] text-[#7B1FA2] hover:border-[#7B1FA2] flex items-center gap-2 border cursor-pointer p-2 px-4 rounded font-medium transition-colors"
                      onClick={handleReportSidebarOpen}
                    >
                      <svg
                        className="w-5 h-5"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path opacity="0.3" d="M19 22H5C4.4 22 4 21.6 4 21V3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22ZM12.5 18C12.5 17.4 12.6 17.5 12 17.5H8.5C7.9 17.5 8 17.4 8 18C8 18.6 7.9 18.5 8.5 18.5L12 18C12.6 18 12.5 18.6 12.5 18ZM16.5 13C16.5 12.4 16.6 12.5 16 12.5H8.5C7.9 12.5 8 12.4 8 13C8 13.6 7.9 13.5 8.5 13.5H15.5C16.1 13.5 16.5 13.6 16.5 13ZM12.5 8C12.5 7.4 12.6 7.5 12 7.5H8C7.4 7.5 7.5 7.4 7.5 8C7.5 8.6 7.4 8.5 8 8.5H12C12.6 8.5 12.5 8.6 12.5 8Z" fill="currentColor"></path>
                        <rect x="7" y="17" width="6" height="2" rx="1" fill="currentColor"></rect>
                        <rect x="7" y="12" width="10" height="2" rx="1" fill="currentColor"></rect>
                        <rect x="7" y="7" width="6" height="2" rx="1" fill="currentColor"></rect>
                        <path d="M15 8H20L14 2V7C14 7.6 14.4 8 15 8Z" fill="currentColor"></path>
                      </svg>
                      Generar reporte
                    </button>
                  </div>
                )}

              </div>
              <div
                className="h-dvh overflow-y-auto"
                style={{ paddingLeft: 'var(--header-width)' }}
              >
                {showResults ? (
                  <div className='flex flex-col min-h-screen '>
                    {isReportViewerOpen ? (
                      <section className="flex justify-center w-full px-4 pb-10 sm:px-8 lg:pt-20">
                        <div className="w-full max-w-7xl rounded-lg border border-gray-200 bg-white shadow">
                          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                            <h4 className="text-sm font-semibold text-gray-800">REPORTE DE DATOS</h4>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleReportViewerClose}
                                className="rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600"
                              >
                                Salir
                              </button>
                              <a
                                href="/files/Reporte-Detallado.pdf"
                                download
                                className="rounded bg-[#009ef7] px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                Descargar
                              </a>
                            </div>
                          </div>
                          <div className="h-[70vh] w-full">
                            <iframe
                              title="Reporte de datos"
                              src="/files/Reporte-Detallado.pdf"
                              className="h-full w-full"
                            />
                          </div>
                        </div>
                      </section>
                    ) : (
                      <ValoraResults
                        section={resultsSection}
                        balanceTable={balanceTable}
                        resultsTable={resultsTable}
                        formData={formData}
                      />
                    )}
                    <MainPageFooter />
                  </div>
                ) : (
                  <MainPage />
                )}
              </div>
            </div>
          </>
          :
          <ValoraMobileLayout
            activePanel={activePanel}
            lastPanel={lastPanel}
            showResults={showResults}
            resultsSection={resultsSection}
            onTogglePanel={togglePanel}
            onClosePanel={() => setActivePanel(null)}
            onChangeResultsSection={handleResultsSectionChange}
            onOpenReportSidebar={handleReportSidebarOpen}
            isFormToggleDisabled={resultsSection === 'metodologia' || isReportSidebarOpen}
            formData={formData}
            dates={dates}
            countries={countries}
            currencies={currencies}
            sectors={sectors}
            fileUploaded={fileUploaded}
            uploadedFileUrl={uploadedFileUrl}
            onClearUploadedFile={handleClearUploadedFile}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onDownloadTemplate={downloadTemplate}
            onUploadTemplate={openUploadTemplateModal}
            currentMobilePage={currentMobilePage}
          />
      }
      <UploadTemplateModal
        key={uploadResetKey}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDownloadTemplate={downloadTemplate}
        onUploadTemplate={handleUploadTemplate}
        onToast={addToast}
      />
      <ReportSidebar
        isOpen={isReportSidebarOpen}
        onClose={handleReportSidebarClose}
        reportProducts={reportProducts}
        selectedReportProductId={selectedReportProductId}
        onSelectReportProduct={setSelectedReportProductId}
        onOpenReportViewer={handleReportViewerOpen}
      />
      <ToastStack toasts={toasts} onDismiss={removeToast} />
      {isLoading && <LoadingOverlay />}
    </div >
  );
};

export default ValoraPage;