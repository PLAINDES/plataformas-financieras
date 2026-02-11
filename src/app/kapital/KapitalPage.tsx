import React, { useState, useEffect } from 'react';
import { NavBar } from './components/NavBar';
import { MenuSidebar } from './components/MenuSidebar';
import { FormSidebar }  from './components/FormSidebar';
import { BalanceSheetBlock } from './components/BalanceSheetBlock';
import { ResultCard } from './components/ResultCard';
import { MethodologyView } from './components/MethodologyView';
import { ReportDrawer } from './components/ReportDrawer';
import { ReportView } from './components/ReportView';

// Types
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

interface MethodologyItem {
  name: string;
  file: string;
}

interface MethodologyCategory {
  name: string;
  products: MethodologyItem[];
}

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

// Main Component
const KapitalPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    date: '', sector: '', instrument: '', bono: '', country: '', devaluation: '',
    tax: '', typeId: false, currency: 'USD', kd: '', debt: '', capital: '',
    useFinancialData: false, dc_ratio: '', effective_tax_rate: '',
    beta_levered: '', beta_unlevered: ''
  });

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);
  const [reportUrl, setReportUrl] = useState<string>('');
  const [results, setResults] = useState<Results | null>(null);
  const [resultCurrency, setResultCurrency] = useState<'pen' | 'usd'>('pen');
  const [projectUid, setProjectUid] = useState<string>('');
  
  // Analysis form state
  const [analysisDC, setAnalysisDC] = useState('');
  const [analysisKd, setAnalysisKd] = useState('');
  const [analysisCurrency, setAnalysisCurrency] = useState('Dólares');

  // Mock methodology data
  const methodologyCategories: MethodologyCategory[] = [
    {
      name: 'Categoría 01',
      products: [
        { name: 'Curso 01', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' },
      ]
    }
  ];

  // Mock report data
  const reportDesigns: ReportDesign[] = [
    { id: '1', name: 'Reporte Básico', content_id: 'basic' },
    { id: '2', name: 'Reporte Detallado', content_id: 'detailed' },
    { id: '3', name: 'Reporte Completo', content_id: 'complete' },
  ];

  const reportContents: ReportContent[] = [
    { id: '1', name: 'Costo de capital del sector', edit: 0 },
    { id: '2', name: 'Costo de capital de la empresa', edit: 0 },
    { id: '3', name: 'Metodología explicada', edit: 0 },
    { id: '4', name: '1 hora de consultoría', edit: 1 },
  ];

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
    // ... (rest of countries)
  ];
  const currencies = ['USD', 'PEN', 'EUR'];

  const formatterx100p = (value: number): string => `${(value * 100).toFixed(2)}%`;

  useEffect(() => {
    if (formData.debt) {
      const debtPercent = parseFloat(formData.debt) || 0;
      setFormData(prev => ({ ...prev, capital: (100 - debtPercent).toFixed(2) }));
    }
  }, [formData.debt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsFormOpen(false);
    
    setTimeout(() => {
      const mockResults: Results = {
        cppc: 0.0856, kd: 0.0654, ke: 0.0923, koa: 0.0789,
        emergent: { cppc: 0.0912, kd: 0.0701, ke: 0.0987, koa: 0.0834 },
        developed: { cppc: 0.0745, kd: 0.0589, ke: 0.0821, koa: 0.0698 }
      };
      setResults(mockResults);
      setProjectUid('demo-project-' + Date.now());
      setLoading(false);
      setShowResults(true);
      setShowAnalysis(false);
      setShowMethodology(false);
      setIsMenuOpen(true); // Abrir menú automáticamente tras calcular
    }, 1500);
  };

  const handleAnalysisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const dc = parseFloat(analysisDC) || 150;
      const kd = parseFloat(analysisKd) || 6.54;
      
      if (results) {
        const newResults: Results = {
          ...results,
          cppc: 0.0856 + (dc / 10000),
          kd: kd / 100,
        };
        setResults(newResults);
      }
      setLoading(false);
    }, 800);
  };

  const handleShowAnalysis = () => {
    setShowResults(false);
    setShowAnalysis(true);
    setShowMethodology(false);
    if (results) {
      setAnalysisKd((results.kd * 100).toFixed(2));
    }
  };

  const handleShowMethodology = () => {
    setShowResults(false);
    setShowAnalysis(false);
    setShowMethodology(true);
  };

  const handleShowResults = () => {
    setShowResults(true);
    setShowAnalysis(false);
    setShowMethodology(false);
    setShowReport(false);
  };

  const handleGenerateReport = (reportId: string, contentIds: string[]) => {
    const localReportUrl = `/files/Reporte-Detallado.pdf`;
    
    setReportUrl(localReportUrl);
    setShowResults(false);
    setShowAnalysis(false);
    setShowMethodology(false);
    setShowReport(true);
    setIsReportDrawerOpen(false);
  };

  const getSelectedView = (): 'result' | 'analysis' | 'methodology' | '' => {
    if (showMethodology) return 'methodology';
    if (showAnalysis) return 'analysis';
    if (showResults) return 'result';
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <NavBar
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        onToggleForm={() => setIsFormOpen(!isFormOpen)}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        isMenuOpen={isMenuOpen}
        isFormOpen={isFormOpen}
        hasResults={!!results}
      />

      {/* Menu Sidebar (Left) */}
      <MenuSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        selected={getSelectedView()}
        onNavigate={(view) => {
          if (view === 'result') handleShowResults();
          else if (view === 'analysis') handleShowAnalysis();
          else if (view === 'methodology') handleShowMethodology();
        }}
        onOpenReport={() => setIsReportDrawerOpen(true)}
        hasResults={!!results}
      />
  
      {/* Form Sidebar (Right) */}
      <FormSidebar
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        loading={loading}
        dates={dates}
        sectors={sectors}
        instruments={instruments}
        bonos={bonos}
        countries={countries}
        currencies={currencies}
        hasResults={!!results}
      />

      {/* Main Content */}
<main className={`pt-16 transition-all duration-300 ${isFormOpen && !results  ? 'lg:pl-110' : 'lg:pl-0'} ${isMenuOpen ? 'lg:pr-64' : 'lg:pr-0'}`}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent" />
              </div>
              <p className="mt-4 text-lg font-medium text-gray-700">Calculando resultados...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !showResults && !showAnalysis && !showMethodology && !showReport && (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="max-w-md text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Bienvenido a la Calculadora WACC
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Completa los inputs del formulario y presiona calcular para generar resultados instantáneos y análisis detallados.
                </p>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Abrir Formulario
                </button>
              </div>
            </div>
          )}

          {/* METHODOLOGY VIEW */}
          {!loading && showMethodology && (
            <MethodologyView categories={methodologyCategories} />
          )}

          {/* REPORT VIEW */}
          {!loading && showReport && reportUrl && (
            <ReportView reportUrl={reportUrl} reportId={projectUid} />
          )}

          {/* ANALYSIS VIEW */}
          {!loading && showAnalysis && results && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Sensibilidad de resultados</h1>
                  <p className="text-gray-600">Análisis de la tasa de tu empresa</p>
                </div>
                {formData.typeId && (
                  <select 
                    className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={resultCurrency} 
                    onChange={(e) => setResultCurrency(e.target.value as any)}
                  >
                    <option value="pen">PEN</option>
                    <option value="usd">USD</option>
                  </select>
                )}
              </div>

              {/* Analysis Cards */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Form Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">Empresa/Sector</h3>
                    <button 
                      type="submit" 
                      form="formSector"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Calcular
                    </button>
                  </div>
                  <div className="p-6">
                    <form id="formSector" onSubmit={handleAnalysisSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Relación D/C <span className="text-red-600">*</span>
                        </label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 text-sm text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          value={analysisDC}
                          onChange={(e) => setAnalysisDC(e.target.value)}
                          placeholder="150" 
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Costo de Deuda (Kd) <span className="text-red-600">*</span>
                        </label>
                        <div className="flex gap-1">
                          <select 
                            className="w-28 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={analysisCurrency}
                            onChange={(e) => setAnalysisCurrency(e.target.value)}
                            disabled={!formData.typeId}
                          >
                            <option value="Dólares">Dólares</option>
                            <option value="Soles">Soles</option>
                            
                          </select>
                          <div className="flex-1 flex ">
                            <input 
                              type="text" 
                              className="flex-1 px-1 py-2 text-sm text-center border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              value={analysisKd}
                              onChange={(e) => setAnalysisKd(e.target.value)}
                              required
                            />
                            <span className="inline-flex items-center px-2 text-xs font-bold text-gray-500 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg">
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Chart Card */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-base font-bold text-gray-900">Empresa/Sector</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6 items-center">
                      <div className="flex items-center justify-center">
                        <BalanceSheetBlock 
                          koa={formatterx100p(results.koa)}
                          kd={formatterx100p(results.kd)}
                          ke={formatterx100p(results.ke)}
                        />
                      </div>
                      <div className="text-center">
                        <h2 className="text-5xl font-black text-gray-900 mb-2">{formatterx100p(results.cppc)}</h2>
                        <span className="text-sm font-medium text-gray-600">CPPC</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ResultCard icon="fa-solid fa-file-lines" title="CPPC" description="Costo Promedio Ponderado de Capital" value={formatterx100p(results.cppc)} />
                <ResultCard icon="fa-solid fa-pencil" title="Kd*(1-T)" description="Costo de Deuda Después de Impuestos" value={formatterx100p(results.kd)} />
                <ResultCard icon="fa-solid fa-chart-column" title="Ke" description="Costo de Capital Financiero" value={formatterx100p(results.ke)} />
                <ResultCard icon="fa-solid fa-signal" title="Koa" description="Costo de Capital Económico" value={formatterx100p(results.koa)} />
              </div>
            </div>
          )}

          {/* RESULTS VIEW */}
          {!loading && showResults && results && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Resultados generales</h1>
                <p className="text-gray-600">Comparación de resultados</p>
              </div>

              {formData.typeId ? (
                <>
                  {/* Company + Markets View */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden ${resultCurrency === 'usd' ? 'border-orange-500' : 'border-green-500'}`}>
                      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">Empresa</h3>
                        <select 
                          className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={resultCurrency} 
                          onChange={(e) => setResultCurrency(e.target.value as any)}
                        >
                          <option value="pen">PEN</option>
                          <option value="usd">USD</option>
                        </select>
                      </div>
                      <div className="py-8 text-center">
                        <h2 className="text-4xl font-black text-gray-900 mb-2">{formatterx100p(results.cppc)}</h2>
                        <span className="text-sm font-medium text-gray-600">CPPC</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-base font-bold text-gray-900">Mercado emergente</h3>
                      </div>
                      <div className="py-8 text-center">
                        <h2 className="text-4xl font-black text-gray-900 mb-2">{formatterx100p(results.emergent.cppc)}</h2>
                        <span className="text-sm font-medium text-gray-600">CPPC</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-base font-bold text-gray-900">Mercado desarrollado</h3>
                      </div>
                      <div className="py-8 text-center">
                        <h2 className="text-4xl font-black text-gray-900 mb-2">{formatterx100p(results.developed.cppc)}</h2>
                        <span className="text-sm font-medium text-gray-600">CPPC</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ResultCard icon="fa-solid fa-file-lines" title="CPPC" description="Costo Promedio Ponderado de Capital" value={formatterx100p(results.cppc)} />
                    <ResultCard icon="fa-solid fa-pencil" title="Kd*(1-T)" description="Costo de Deuda Después de Impuestos" value={formatterx100p(results.kd)} />
                    <ResultCard icon="fa-solid fa-chart-column" title="Ke" description="Costo de Capital Financiero" value={formatterx100p(results.ke)} />
                    <ResultCard icon="fa-solid fa-signal" title="Koa" description="Costo de Capital Económico" value={formatterx100p(results.koa)} />
                  </div>
                </>
              ) : (
                <>
                  {/* Market Comparison View */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="grid lg:grid-cols-3">
                      <div className="lg:col-span-2 border-r border-gray-200 p-8">
                        <h3 className="text-base font-bold text-gray-900 mb-6">Resultados del mercado emergente</h3>
                        <BalanceSheetBlock 
                          koa={formatterx100p(results.emergent.koa)}
                          kd={formatterx100p(results.emergent.kd)}
                          ke={formatterx100p(results.emergent.ke)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="border-b border-gray-200 p-6 text-center bg-gray-50">
                          <h2 className="text-4xl font-black text-gray-900 mb-2">{formatterx100p(results.emergent.cppc)}</h2>
                          <span className="text-sm font-medium text-gray-600">Costo promedio de capital (CPPC)</span>
                        </div>
                        <div className="p-6 space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-base font-bold text-gray-900">{formatterx100p(results.emergent.kd)}</p>
                              <p className="text-xs text-gray-600">Costo de deuda después de impuestos (Kd*(1-T))</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-base font-bold text-gray-900">{formatterx100p(results.emergent.ke)}</p>
                              <p className="text-xs text-gray-600">Costo de capital financiero (Ke)</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-base font-bold text-gray-900">{formatterx100p(results.emergent.koa)}</p>
                              <p className="text-xs text-gray-600">Costo de capital económico (Koa)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="grid lg:grid-cols-3">
                      <div className="lg:col-span-2 border-r border-gray-200 p-8">
                        <h3 className="text-base font-bold text-gray-900 mb-6">Resultados del mercado desarrollado</h3>
                        <BalanceSheetBlock 
                          koa={formatterx100p(results.developed.koa)}
                          kd={formatterx100p(results.developed.kd)}
                          ke={formatterx100p(results.developed.ke)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="border-b border-gray-200 p-6 text-center bg-gray-50">
                          <h2 className="text-4xl font-black text-gray-900 mb-2">{formatterx100p(results.developed.cppc)}</h2>
                          <span className="text-sm font-medium text-gray-600">Costo promedio de capital (CPPC)</span>
                        </div>
                        <div className="p-6 space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-base font-bold text-gray-900">{formatterx100p(results.developed.kd)}</p>
                              <p className="text-xs text-gray-600">Costo de deuda después de impuestos (Kd*(1-T))</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-base font-bold text-gray-900">{formatterx100p(results.developed.ke)}</p>
                              <p className="text-xs text-gray-600">Costo de capital financiero (Ke)</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-base font-bold text-gray-900">{formatterx100p(results.developed.koa)}</p>
                              <p className="text-xs text-gray-600">Costo de capital económico (Koa)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="mt-12 bg-green-50 border-t border-green-100">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                  Valora
                </h2>
                <p className="text-sm text-gray-600">
                  Obtén una evaluación precisa y confiable para tomar decisiones informadas.
                </p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Suscríbete
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  Suscríbete ahora para estar al tanto de lo último en finanzas, como webinars, noticias y ofertas.
                </p>
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    const formData = new FormData(e.currentTarget);
                    alert(`Suscripción: ${formData.get('email')}`);
                    e.currentTarget.reset();
                  }}
                  className="flex gap-2"
                >
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Tu email" 
                    required
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Suscribirse
                  </button>
                </form>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* REPORT DRAWER */}
      <ReportDrawer
        isOpen={isReportDrawerOpen}
        onClose={() => setIsReportDrawerOpen(false)}
        onGenerateReport={handleGenerateReport}
        designs={reportDesigns}
        contents={reportContents}
      />
    </div>
  );
};

export default KapitalPage;

