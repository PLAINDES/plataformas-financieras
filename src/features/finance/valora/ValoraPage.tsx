import React, { useEffect, useRef, useState } from 'react';
import { FinancePageTemplate } from '../components/MainPage';
import { UploadTemplateModal } from './components/UploadTemplateModal';
import { ValoraResults } from './components/ValoraResults';
import { LoadingOverlay } from '@/shared/components/common/LoadingOverlay';
import { ToastStack } from '@/shared/components/common/ToastStack';
import type { FinancialTable, FormData } from '@/shared/types/ValoraTypes';
import type { ToastType } from '@/shared/types/toast.types';
import { MainPageFooter } from '../components/MainPageFooter';
import { parseFinancialTablesFromFile } from './types/valoraFileParsing';
import { NavBar } from './components/Navbar';
import { NavigationTabs } from './components/ValoraNavigationTabs';
import { ValoraFormPanel } from './components/ValoraFormPanel';
import { ReportSidebar } from '../components/ReportSidebar';

import { useAuth } from '@/features/auth/hooks/useAuth';
const ValoraPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    date: '',
    country: '',
    currency: '',
    sector: '',
    fileUsername: '',
    action: '',
    longgrowth: '',
    capitalcost: '',
    revenuegrowth: ''
  });
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isDesktopFormOpen, setIsDesktopFormOpen] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; message: string }>>([]);
  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  const [resultsSection, setResultsSection] = useState<'estados' | 'resultados' | 'analisis' | 'metodologia'>('resultados');
  const [isResultsSidebarOpen, setIsResultsSidebarOpen] = useState(false);
  const [isReportSidebarOpen, setIsReportSidebarOpen] = useState(false);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [selectedReportProductId, setSelectedReportProductId] = useState('datos');
  const [balanceTable, setBalanceTable] = useState<FinancialTable | null>(null);
  const [resultsTable, setResultsTable] = useState<FinancialTable | null>(null);
  const mainContent = showResults ? (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {isReportViewerOpen ? (
        <section className="flex justify-center w-full px-4 pb-10 sm:px-8 lg:pt-6">
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
                  className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
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
      <MainPageFooter 
        brandName={"Valora"} 
        brandHref={"/valora"} 
        />
    </div>
  ) : (
    <FinancePageTemplate 
        brandName="Kapital"
        brandHref="/kapital"
        heroTitle="Bienvenido a Valora"
        onOpenForm={() => setIsDesktopFormOpen(prev => !prev)}
    />
  );

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
    if (isDesktopFormOpen) {
      setIsDesktopFormOpen(false);
    }
  };

  const handleReportSidebarClose = () => {
    setIsReportSidebarOpen(false);
  };

  const toggleResultsSidebar = () => {
    setIsResultsSidebarOpen(prev => !prev);
  };

  const handleReportViewerOpen = () => {
    setIsReportViewerOpen(true);
    setIsReportSidebarOpen(false);
  };

  function handleReportViewerClose() {
    setIsReportViewerOpen(false);
  }

  useEffect(() => {
    if (!showResults) {
      setIsResultsSidebarOpen(false);
    }
  }, [showResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      setIsResultsSidebarOpen(true);
      setIsDesktopFormOpen(false);
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

   const getSelectedView = (): 'estados' | 'resultados' | 'analisis' | 'metodologia' | '' => {
    if (!showResults) return '';
    return resultsSection;
  };

  const { user } = useAuth();


  const handleLogout = () => {
    return ''
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      
    <NavBar
      user={user}
      onLogout={handleLogout}
      onToggleForm={() => setIsDesktopFormOpen(prev => !prev)}
      isFormOpen={isDesktopFormOpen}
      hasResults={showResults}
      logoHref="/valora"
      logoSrc="/public/images/logo-valora-small.png"
      logoAlt="Valora Logo"
      projectsHref="/valora/proyectos"
      selected={getSelectedView()}
      onNavigate={handleResultsSectionChange}
      onOpenReport={handleReportSidebarOpen}
    />

       <NavigationTabs
        selected={getSelectedView()}
        onNavigate={handleResultsSectionChange}
        onOpenReport={handleReportSidebarOpen}
        hasResults={showResults}
      />
      <main
        className={`${showResults ? 'pt-24 lg:pt-16' : 'pt-12 lg:pt-16'} transition-all h-screen duration-300 ${isDesktopFormOpen ? 'lg:pl-105' : 'lg:pl-0'}`}
      >
        {mainContent}
      </main>
      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-105 border-r border-gray-200 bg-white shadow-sm transition-transform duration-200 ${isDesktopFormOpen ? 'translate-x-0' : '-translate-x-105'}`}
      >
        <div className="h-full overflow-y-auto p-4">
          <ValoraFormPanel
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
        </div>
      </aside>
 
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
    </div>
  );
};

export default ValoraPage;