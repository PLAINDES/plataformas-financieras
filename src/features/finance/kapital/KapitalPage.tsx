import React, { useState, useEffect, useRef } from 'react';
import { NavBar } from './components/NavBar';
import { NavigationTabs } from './components/NavigationTabs';
import { FormSidebar } from './components/FormSidebar';
import { FinancePageTemplate } from '../components/MainPage';
import { KapitalResults } from './components/KapitalResults';
import { ReportSidebar } from '../components/ReportSidebar';
import { LoadingOverlay } from '@/shared/components/common/LoadingOverlay';
import { ToastStack } from '@/shared/components/common/ToastStack';
import { MainPageFooter } from '../components/MainPageFooter';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { ReportProduct } from '../components/ReportSidebar';
import type { ToastType } from '@/shared/types/toast.types';
import './KapitalPage.css';

interface FormData {
  date: string;
  sector: string;
  instrument: string;
  bono: string;
  country: string;
  devaluation: string;
  tax: string;
  typeId: boolean;
  currency: string;
  kd: string;
  debt: string;
  capital: string;
  useFinancialData: boolean;
  dc_ratio: string;
  effective_tax_rate: string;
  beta_levered: string;
  beta_unlevered: string;
}

interface MarketResults {
  cppc: number;
  kd: number;
  ke: number;
  koa: number;
}

interface Results {
  cppc: number;
  kd: number;
  ke: number;
  koa: number;
  emergent: MarketResults;
  developed: MarketResults;
}

interface MethodologyCategory {
  name: string;
  products: { name: string; file: string }[];
}

const KapitalPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    date: '', sector: '', instrument: '', bono: '', country: '', devaluation: '',
    tax: '', typeId: false, currency: 'USD', kd: '', debt: '', capital: '',
    useFinancialData: false, dc_ratio: '', effective_tax_rate: '',
    beta_levered: '', beta_unlevered: ''
  });

  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultsSection, setResultsSection] = useState<'result' | 'analysis' | 'methodology'>('result');
  const [isReportSidebarOpen, setIsReportSidebarOpen] = useState(false);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [selectedReportProductId, setSelectedReportProductId] = useState('1');
  const [results, setResults] = useState<Results | null>(null);
  const [resultCurrency, setResultCurrency] = useState<'pen' | 'usd'>('pen');
  const [analysisDC, setAnalysisDC] = useState('');
  const [analysisKd, setAnalysisKd] = useState('');
  const [analysisCurrency, setAnalysisCurrency] = useState('Dólares');
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; message: string }>>([]);
  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());

  const { user } = useAuth();

  const dates = [
    '29/12/2017', '31/12/2018', '31/12/2019', '31/12/2020', '31/12/2021',
    '30/11/2022', '31/03/2024', '30/06/2024', '30/09/2024', '31/12/2024',
    '31/03/2025', '30/06/2025', '31/10/2025'
  ];
  const sectors = [
    'Tecnología', 'Finanzas', 'Manufactura', 'Servicios', 'Retail', 'Publicidad',
    'Aeroespacial/ Defensa', 'Transporte aéreo', 'Confección de ropa',
    'Automóviles y Camiones', 'Partes de Automóviles', 'Software (Sistema y aplicación)',
    'Acero', 'Telecomunicaciones (Inalámbrico)', 'Equipamiento de telecomunicaciones',
    'Servicios de telecomunicaciones'
  ];
  const instruments = ['Bonos EE.UU', 'Ajustar Rf según la duración del proyecto'];
  const bonos = ['0.25 (3m)', '0.5 (6m)', '1', '2', '3', '5', '7', '10', '20', '30'];
  const countries = [
    'Perú', 'Estados Unidos', 'Chile', 'Colombia', 'México', 'Afganistán', 'Albania',
    'Alemania', 'Andorra', 'Angola', 'Antigua y Barbuda', 'Arabia Saudita', 'Argelia',
    'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaiyán', 'Bahamas', 'Bangladés'
  ];
  const currencies = ['USD', 'PEN', 'EUR'];
  const reportProducts: ReportProduct[] = [
    { id: '1', title: 'REPORTE BÁSICO', iconClassName: 'fa-solid fa-laptop text-2xl text-gray-400' },
    { id: '2', title: 'REPORTE DETALLADO', iconClassName: 'fa-solid fa-laptop text-2xl text-gray-400' },
    { id: '3', title: 'REPORTE COMPLETO', iconClassName: 'fa-solid fa-laptop text-2xl text-gray-400' }
  ];
  const methodologyCategories: MethodologyCategory[] = [
    {
      name: 'Categoría 01',
      products: [
        { name: 'Curso 01', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' }
      ]
    }
  ];

  useEffect(() => () => {
    toastTimeoutsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId));
    toastTimeoutsRef.current.clear();
  }, []);

  useEffect(() => {
    if (formData.debt) {
      const debtPercent = parseFloat(formData.debt) || 0;
      setFormData(prev => ({ ...prev, capital: (100 - debtPercent).toFixed(2) }));
    }
  }, [formData.debt]);

  useEffect(() => {
    if (!showResults) {
      setIsReportViewerOpen(false);
    }
  }, [showResults]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missingFields: string[] = [];
    if (!formData.date) missingFields.push('Fecha');
    if (!formData.sector) missingFields.push('Sector');
    if (!formData.country) missingFields.push('País');
    if (missingFields.length > 0) {
      addToast('warn', `Completa los campos: ${missingFields.join(', ')}`);
      return;
    }

    setShowResults(false);
    setIsLoading(true);

    window.setTimeout(() => {
      const mockResults: Results = {
        cppc: 0.0856, kd: 0.0654, ke: 0.0923, koa: 0.0789,
        emergent: { cppc: 0.0912, kd: 0.0701, ke: 0.0987, koa: 0.0834 },
        developed: { cppc: 0.0745, kd: 0.0589, ke: 0.0821, koa: 0.0698 }
      };
      setResults(mockResults);
      setIsLoading(false);
      setShowResults(true);
      setIsFormOpen(false);
      setResultsSection('result');
      addToast('success', 'Resultados generados correctamente.');
    }, 1500);
  };

  const handleAnalysisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    window.setTimeout(() => {
      const dc = parseFloat(analysisDC) || 150;
      const kd = parseFloat(analysisKd) || 6.54;
      if (results) {
        setResults({ ...results, cppc: 0.0856 + (dc / 10000), kd: kd / 100 });
      }
      setIsLoading(false);
      addToast('success', 'Análisis calculado correctamente.');
    }, 800);
  };

  const handleResultsSectionChange = (nextSection: 'result' | 'analysis' | 'methodology') => {
    setResultsSection(nextSection);
    if (nextSection === 'methodology' && isFormOpen) {
      setIsFormOpen(false);
    }
  };

  const handleReportSidebarOpen = () => {
    setIsReportSidebarOpen(true);
    if (isFormOpen) setIsFormOpen(false);
  };

  const handleReportViewerOpen = () => {
    setIsReportViewerOpen(true);
    setIsReportSidebarOpen(false);
  };

  const handleLogout = () => { return ''; };

  const getSelectedView = (): 'result' | 'analysis' | 'methodology' | '' => {
    if (!showResults) return '';
    return resultsSection;
  };

  const mainContent = showResults ? (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {isReportViewerOpen ? (
        <section className="flex justify-center w-full px-4 pb-10 sm:px-8 lg:pt-6">
          <div className="w-full max-w-7xl rounded-lg border border-gray-200 bg-white shadow">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h4 className="text-sm font-semibold text-gray-800">
                {selectedReportProductId === '1' ? 'REPORTE BÁSICO' :
                  selectedReportProductId === '2' ? 'REPORTE DETALLADO' :
                    'REPORTE COMPLETO'}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportViewerOpen(false)}
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
                title="Reporte de capital"
                src="/files/Reporte-Detallado.pdf"
                className="h-full w-full"
              />
            </div>
          </div>
        </section>
      ) : (
        <KapitalResults
          section={resultsSection}
          results={results}
          formData={formData}
          resultCurrency={resultCurrency}
          onResultCurrencyChange={setResultCurrency}
          analysisDC={analysisDC}
          analysisKd={analysisKd}
          analysisCurrency={analysisCurrency}
          onAnalysisDCChange={setAnalysisDC}
          onAnalysisKdChange={setAnalysisKd}
          onAnalysisCurrencyChange={setAnalysisCurrency}
          onAnalysisSubmit={handleAnalysisSubmit}
          loading={isLoading}
          methodologyCategories={methodologyCategories}
        />
      )}
      <MainPageFooter brandName="Valora" brandHref="/valora" />
    </div>
  ) : (
    <FinancePageTemplate
      brandName="Valora"
      brandHref="/valora"
      heroTitle="Bienvenido a Kapital"
      onOpenForm={() => setIsFormOpen(prev => !prev)}
    />
  );

  return (
    <div className="min-h-dvh bg-gray-50">
      <NavBar
        user={user}
        onLogout={handleLogout}
        onToggleForm={() => setIsFormOpen(prev => !prev)}
        isFormOpen={isFormOpen}
        hasResults={!!results}
        logoHref="/kapital"
        logoSrc="/public/images/logo-kapital-small.png"
        logoAlt="Kapital Logo"
        projectsHref="/usuario/proyectos"
        selected={getSelectedView()}
        onNavigate={handleResultsSectionChange}
        onOpenReport={handleReportSidebarOpen}
      />

      <NavigationTabs
        selected={getSelectedView()}
        onNavigate={handleResultsSectionChange}
        onOpenReport={handleReportSidebarOpen}
        hasResults={!!results}
      />

      <main
        className={`${showResults ? 'pt-24 lg:pt-16' : 'pt-12 lg:pt-16'} h-screen transition-all duration-300 ${isFormOpen ? 'lg:pl-105' : 'lg:pl-0'}`}
      >
        {mainContent}
      </main>

      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-105 border-r border-gray-200 bg-white shadow-sm transition-transform duration-200 ${isFormOpen ? 'translate-x-0' : '-translate-x-105'}`}
      >
        <div className="h-full overflow-y-auto p-4">
          <FormSidebar
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            loading={isLoading}
            dates={dates}
            sectors={sectors}
            instruments={instruments}
            bonos={bonos}
            countries={countries}
            currencies={currencies}
            hasResults={!!results}
          />
        </div>
      </aside>

      <ReportSidebar
        isOpen={isReportSidebarOpen}
        onClose={() => setIsReportSidebarOpen(false)}
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

export default KapitalPage;