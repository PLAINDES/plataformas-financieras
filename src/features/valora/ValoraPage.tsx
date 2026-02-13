import React, { useState, useEffect } from 'react';
import './ValoraPage.css';
import { MethodologyView } from './components/MethodologyView';
import { ReportDrawer } from './components/ReportDrawer';
import { ReportView } from './components/ReportView';
// Types
interface FormData {
  date: string;
  country: string;
  currency: string;
  sector: string;
  fileUsername: string;
  action: string;
  longgrowth: string;
  capitalcost: string;
  revenuegrowth: string;
}

interface BalanceSheetResults {
  patrimony: number;
  company: number;
  action: number;
}

interface Results {
  concept: BalanceSheetResults;
  integrated: BalanceSheetResults;
}

interface BVLData {
  company: string;
  action: string;
  marketCap: string;
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

// Component: Navbar
const Navbar: React.FC<{
  uid?: string;
  selected: 'result' | 'analysis' | 'methodology' | '';
  onNavigate?: (view: 'result' | 'analysis' | 'methodology') => void;
  onOpenReport?: () => void;
}> = ({ uid, selected, onNavigate, onOpenReport }) => (
  <div className="navbar-actions d-flex align-items-center">
    {uid && (
      <>
        <div className="d-flex ms-3">
          <button 
            onClick={() => onNavigate?.('result')}
            className={`btn btn-flex flex-center bg-body btn-color-gray-700 btn-active-color-primary w-40px w-md-auto h-40px py-2 px-3 px-md-6 ${selected === 'result' ? 'active' : ''}`}
          >
            <span className="svg-icon svg-icon-2 svg-icon-primary me-0 me-md-2">
              <i className="fa-solid fa-square-poll-vertical"></i>
            </span>
            <span className="d-none d-md-inline">Resultados</span>
          </button>
        </div>
        <div className="d-flex ms-3 ">
          <button 
            onClick={() => onNavigate?.('analysis')}
            className={`btn btn-flex flex-center bg-body btn-color-gray-700 btn-active-color-primary w-40px w-md-auto h-40px py-2 px-3 px-md-6 ${selected === 'analysis' ? 'active' : ''}`}
          >
            <span className="svg-icon svg-icon-2 svg-icon-primary me-0 me-md-2">
              <i className="fa-solid fa-chart-line"></i>
            </span>
            <span className="d-none d-md-inline">Análisis</span>
          </button>
        </div>
        <div className="d-flex ms-3">
          <button 
            onClick={() => onNavigate?.('methodology')}
            className={`btn btn-flex flex-center bg-body btn-color-gray-700 btn-active-color-primary w-40px w-md-auto h-40px py-2 px-3 px-md-6 ${selected === 'methodology' ? 'active' : ''}`}
            style={{ background: 'transparent', border: '1px solid #e4e6ef' }}
          >
              <span className=" svg-icon-2 svg-icon-primary me-0 me-md-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity="0.3" d="M19 22H5C4.4 22 4 21.6 4 21V3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22ZM12.5 18C12.5 17.4 12.6 17.5 12 17.5H8.5C7.9 17.5 8 17.4 8 18C8 18.6 7.9 18.5 8.5 18.5L12 18C12.6 18 12.5 18.6 12.5 18ZM16.5 13C16.5 12.4 16.6 12.5 16 12.5H8.5C7.9 12.5 8 12.4 8 13C8 13.6 7.9 13.5 8.5 13.5H15.5C16.1 13.5 16.5 13.6 16.5 13ZM12.5 8C12.5 7.4 12.6 7.5 12 7.5H8C7.4 7.5 7.5 7.4 7.5 8C7.5 8.6 7.4 8.5 8 8.5H12C12.6 8.5 12.5 8.6 12.5 8Z" fill="currentColor" />
                  <rect x="7" y="17" width="6" height="2" rx="1" fill="currentColor" />
                  <rect x="7" y="12" width="10" height="2" rx="1" fill="currentColor" />
                  <rect x="7" y="7" width="6" height="2" rx="1" fill="currentColor" />
                  <path d="M15 8H20L14 2V7C14 7.6 14.4 8 15 8Z" fill="currentColor" />
                </svg>
              </span>
              <span className="d-none d-md-inline">Metodología</span>
     
          </button>
        </div>
        <div className="d-flex ms-3">
          <button 
            onClick={onOpenReport}
            className="btn btn-flex flex-center bg-body btn-color-primary w-40px w-md-auto h-40px py-2 px-3 px-md-6 active-report">
            <span className="
            svg-icon-2 svg-icon-primary me-0 me-md-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.3" d="M19 22H5C4.4 22 4 21.6 4 21V3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22ZM12.5 18C12.5 17.4 12.6 17.5 12 17.5H8.5C7.9 17.5 8 17.4 8 18C8 18.6 7.9 18.5 8.5 18.5L12 18C12.6 18 12.5 18.6 12.5 18ZM16.5 13C16.5 12.4 16.6 12.5 16 12.5H8.5C7.9 12.5 8 12.4 8 13C8 13.6 7.9 13.5 8.5 13.5H15.5C16.1 13.5 16.5 13.6 16.5 13ZM12.5 8C12.5 7.4 12.6 7.5 12 7.5H8C7.4 7.5 7.5 7.4 7.5 8C7.5 8.6 7.4 8.5 8 8.5H12C12.6 8.5 12.5 8.6 12.5 8Z" fill="currentColor" />
                <rect x="7" y="17" width="6" height="2" rx="1" fill="currentColor" />
                <rect x="7" y="12" width="10" height="2" rx="1" fill="currentColor" />
                <rect x="7" y="7" width="6" height="2" rx="1" fill="currentColor" />
                <path d="M15 8H20L14 2V7C14 7.6 14.4 8 15 8Z" fill="currentColor" />
              </svg>
            </span>
            <span className="d-none d-md-inline">Generar Reportes</span>
          </button>
        </div>
      </>
    )}
  </div>
);

// Component: Form Section
const FormSection: React.FC<{
  title: string;
  number: number;
  subtitle?: string;
  children: React.ReactNode;
  toggle?: boolean;
  onToggle?: () => void;
}> = ({ title, number, subtitle, children, toggle, onToggle }) => (
  <>
    <div className="card-header px-2 mt-2">
      <div className="card-title">
        <span className="badge bg-info rounded-circle me-1 fs-6">{number}</span>
        <div className="ms-2 me-auto lh-1">
          <div className="fw-semibold fs-7">
            {title}
            {toggle !== undefined && (
              <label className="float-end ms-2">
                <i 
                  className={`fa-solid ${toggle ? 'fa-toggle-on' : 'fa-toggle-off'} fs-5 text-dark`}
                  style={{ cursor: 'pointer' }}
                  onClick={onToggle}
                />
              </label>
            )}
          </div>
          {subtitle && <small className="fs-8">{subtitle}</small>}
        </div>
      </div>
    </div>
    <div className={`card-body px-2 pb-0 ${toggle !== undefined ? `collapse ${toggle ? 'show' : ''}` : ''}`}>
      {children}
    </div>
  </>
);

// Component: Form Input
const FormInput: React.FC<{
  label: string;
  name: string;
  type?: 'text' | 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: string[];
  suffix?: string;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  tooltip?: string;
}> = ({ label, name, type = 'text', value, onChange, options, suffix, required, readOnly, placeholder, tooltip }) => (
  <div className="mb-2 row">
    <label className="col-lg-4 col-form-label col-form-label-sm">
      {label}
      {tooltip && <i className="fas fa-info-circle ms-1 fs-8" title={tooltip} />}
    </label>
    <div className="col-lg-8">
      <div className={suffix ? 'input-group input-group-sm' : ''}>
        {type === 'select' ? (
          <select className="form-select form-select-sm" name={name} value={value} onChange={onChange} required={required}>
            <option value="">SELECCIONE</option>
            {options?.map(item => <option className='fw-normal' key={item} value={item}>{item}</option>)}
          </select>
        ) : (
          <input 
            type="text" 
            className="form-control form-control-sm" 
            name={name} 
            value={value} 
            onChange={onChange} 
            required={required}
            readOnly={readOnly}
            placeholder={placeholder}
          />
        )}
        {suffix && <span className="input-group-text fs-8">{suffix}</span>}
      </div>
    </div>
  </div>
);

// Component: Balance Sheet Visual Block (Valora version)
const BalanceSheetBlock: React.FC<{
  patrimony: string;
  deuda: string;
}> = ({ patrimony, deuda }) => (
  <div className="bs-balance-block" style={{ height: '250px', width: '500px', margin: 'auto' }}>
    <div style={{ width: '100%', display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <div className="bs-block-activo">
          <div className="bs-block-label">Activo</div>
          <div className="bs-block-value">Valor Empresa</div>
        </div>
      </div>
      <div style={{ width: '50%' }}>
        <div className="bs-block-pasivo">
          <div className="bs-block-label">Pasivo</div>
          <div className="bs-block-value">{deuda}</div>
        </div>
        <div className="bs-block-patrimonio">
          <div className="bs-block-label">Patrimonio</div>
          <div className="bs-block-value">{patrimony}</div>
        </div>
      </div>
    </div>
    <div className="bs-block-legend">
      <div className="bs-legend-item">
        <div className="bs-legend-color bg-patrimonio"></div>
        <div className="bs-legend-text">Patrimonio</div>
      </div>
      <div className="bs-legend-item">
        <div className="bs-legend-color bg-activo"></div>
        <div className="bs-legend-text">Activo</div>
      </div>
      <div className="bs-legend-item">
        <div className="bs-legend-color bg-pasivo"></div>
        <div className="bs-legend-text">Pasivo</div>
      </div>
    </div>
  </div>
);

// Component: Result Value Card
const ResultValueCard: React.FC<{
  title: string;
  value: string;
  colorClass: string;
}> = ({ title, value, colorClass }) => (
  <li className="list-group-item py-10">
    <div className="row">
      <div className="col"><h4>{title}</h4></div>
      <div className="col text-end"><h4 className={`${colorClass} fs-4`}>{value}</h4></div>
    </div>
  </li>
);

// Main Component
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

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAsideMinimized, setIsAsideMinimized] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);
  const [reportUrl, setReportUrl] = useState<string>('');
  const [results, setResults] = useState<Results | null>(null);
  const [projectUid, setProjectUid] = useState<string>('');

  
  // Analysis form state
  const [analysisLongGrowth, setAnalysisLongGrowth] = useState('');
  const [analysisCapitalCost, setAnalysisCapitalCost] = useState('');
  const [analysisRevenueGrowth, setAnalysisRevenueGrowth] = useState('');

    // Analysis form state
    const [analysisDC, setAnalysisDC] = useState('');
    const [analysisKd, setAnalysisKd] = useState('');
    const [analysisCurrency, setAnalysisCurrency] = useState('Soles');

  // BVL Data
  const [companies, setCompanies] = useState<string[][]>([]);
  const [selectedCompany, setSelectedCompany] = useState<BVLData | null>(null);
  const [loadingBVL, setLoadingBVL] = useState(false);

    const methodologyCategories: MethodologyCategory[] = [
    {
      name: 'Categoría 01',
      products: [
        { name: 'Curso 01', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' },
      ]
    }, 
    {
      name: 'Módulo 01',
      products: [
        { name: 'Mercado 01', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' },
      ]
    }
  ];

   // Mock report data - replace with real data from API
  const reportDesigns: ReportDesign[] = [
    { id: '1', name: 'REPORTE DE DATOS', content_id: 'basic' },
    { id: '2', name: 'REPORTE ESPECIALIZADO', content_id: 'detailed' }
  ];

  const reportContents: ReportContent[] = [
    { id: '1', name: 'Costo de capital del sector', edit: 0 },
    { id: '2', name: 'Costo de capital de la empresa', edit: 0 },
    { id: '3', name: 'Metodología explicada', edit: 0 },
    { id: '4', name: '1 hora de consultoría', edit: 1 },
  ];

    const dates = [
  '29/12/2017', 
  '31/12/2018', 
  '31/12/2019', 
  '31/12/2020', 
  '31/12/2021', 
  '30/11/2022',
  '31/03/2024', 
  '30/06/2024', 
  '30/09/2024', 
  '31/12/2024', 
  '31/03/2025', 
  '30/06/2025', 
  '31/10/2025'
];
  const countries = ['Perú', 'Estados Unidos', 'Chile', 'Colombia', 'México', 'Argentina', 'Brasil'];
  const currencies = ['PEN', 'USD', 'EUR', 'CLP', 'COP', 'MXN'];
    const sectors = [
  'Tecnología',
  'Finanzas',
  'Manufactura',
  'Servicios',
  'Retail',
  'Publicidad',
  'Aeroespacial/ Defensa',
  'Transporte aéreo',
  'Confección de ropa',
  'Automóviles y Camiones',
  'Partes de Automóviles',
  'Software (Sistema y aplicación)',
  'Acero',
  'Telecomunicaciones (Inalámbrico)',
  'Equipamiento de telecomunicaciones',
  'Servicios de telecomunicaciones'
];

  const formatter = (value: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  };

  useEffect(() => {
    // Simular carga de empresas BVL
    setCompanies([
      ['Empresa A', '1000000', '50000000', '50.00'],
      ['Empresa B', '2000000', '100000000', '50.00'],
      ['Empresa C', '1500000', '75000000', '50.00']
    ]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsMobileMenuOpen(false);
    
    setTimeout(() => {
      const mockResults: Results = {
        concept: {
          patrimony: 125000000,
          company: 175000000,
          action: 62.50
        },
        integrated: {
          patrimony: 130000000,
          company: 180000000,
          action: 65.00
        }
      };
      setResults(mockResults);
      setProjectUid('valora-demo-' + Date.now());
      setLoading(false);
      setShowResults(true);
      setShowAnalysis(false);
      setLoadingBVL(false);
    }, 1500);
  };

  const handleAnalysisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      // Recalcular con los nuevos valores
      if (results) {
        const newResults: Results = {
          concept: {
            patrimony: results.concept.patrimony * 1.05,
            company: results.concept.company * 1.05,
            action: results.concept.action * 1.05
          },
          integrated: {
            patrimony: results.integrated.patrimony * 1.05,
            company: results.integrated.company * 1.05,
            action: results.integrated.action * 1.05
          }
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

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    const company = companies[index];
    if (company) {
      setSelectedCompany({
        company: company[0],
        action: company[3],
        marketCap: company[2]
      });
    }
  };

    const handleOpenReportDrawer = () => {
    setIsReportDrawerOpen(true);
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

  
  // Determinar qué vista está activa
  const getSelectedView = (): 'result' | 'analysis' | 'methodology' | '' => {
    if (showMethodology) return 'methodology';
    if (showAnalysis) return 'analysis';
    if (showResults) return 'result';
    // showReport no tiene opción en navbar, se muestra pero navbar no lo marca como activo
    return '';
  };

  return (
    <div className="valora-page">
      {/* Mobile Menu Button */}
      {!isMobileMenuOpen && (
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <i className="fas fa-bars" />
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* ASIDE - Sidebar */}
      <div className={`aside ${isAsideMinimized ? 'minimized' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Primary sidebar */}
        <div className="aside-primary">
          <div className="aside-nav" id="kt_aside_nav">
            <div className="hover-scroll-overlay-y">
              <ul className="nav flex-column" id="kt_aside_nav_tabs">
                <li className="nav-item">
                  <a className="nav-link active">
                    <span className="svg-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" />
                        <rect opacity="0.3" x="13" y="2" width="9" height="9" rx="2" fill="currentColor" />
                        <rect opacity="0.3" x="13" y="13" width="9" height="9" rx="2" fill="currentColor" />
                        <rect opacity="0.3" x="2" y="13" width="9" height="9" rx="2" fill="currentColor" />
                      </svg>
                    </span>
                  </a>
                </li>
              </ul>
            </div>
            <div className="aside-logo" id="kt_aside_logo">
              <a href="/valora">
                <img alt="Logo" src="/public/images/logo-valora-small.png" className="h-35px" />
              </a>
            </div>
          </div>

          <div className="aside-footer">
            <div className="position-relative">
              <div className="cursor-pointer symbol" onClick={() => setShowUserMenu(!showUserMenu)}>
                <img src="/public/images/blank.png" alt="perfil" />
              </div>

              {showUserMenu && (
                <div className="menu show">
                  <div className="menu-item px-3">
                    <div className="menu-content">
                      <div className="fw-bold fs-7">Usuario Demo</div>
                      <a href="#" className="text-muted fs-8">usuario@demo.com</a>
                    </div>
                  </div>
                  <div className="menu-item px-5">
                    <a href="/valora/proyectos" className="menu-link fs-7">Mis proyectos</a>
                  </div>
                  <div className="separator" />
                  <div className="menu-item px-5">
                    <a href="/auth/signout" className="menu-link fs-7">Cerrar sesión</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary sidebar - Form */}
        <div className="aside-secondary hover-scroll-y">
          <div className="aside-workspace">
            <form className="formVALORA p-2" onSubmit={handleSubmit}>
              <div className="card shadow-none mb-3">
                {/* Section 1: Inputs del País */}
                <FormSection title="Ingrese inputs de su país" number={1}>
                  <FormInput 
                    label="Fecha" 
                    name="date" 
                    type="select" 
                    value={formData.date} 
                    onChange={handleInputChange} 
                    options={dates} 
                    required 
                  />
                  <FormInput 
                    label="País" 
                    name="country" 
                    type="select" 
                    value={formData.country} 
                    onChange={handleInputChange} 
                    options={countries} 
                    required 
                  />
                  <FormInput 
                    label="Moneda" 
                    name="currency" 
                    type="select" 
                    value={formData.currency} 
                    onChange={handleInputChange} 
                    options={currencies} 
                    required 
                  />
                  <FormInput 
                    label="Sector" 
                    name="sector" 
                    type="select" 
                    value={formData.sector} 
                    onChange={handleInputChange} 
                    options={sectors} 
                    required 
                  />
                </FormSection>

                {/* Section 2: Inputs de la Empresa */}
                <FormSection title="Ingrese inputs de su empresa" number={2}>
                  <div className="mb-2 row">
                    <label className="col-lg-8 col-form-label col-form-label-sm">Descargar plantilla EEFF</label>
                    <div className="col-lg-4">
                      <a 
                        href="/assets/files/PlantillaUsuarioValora.xlsx" 
                        className="btn btn-light-primary btn-sm float-end" 
                        download
                      >
                        <i className="fa-solid fa-download"></i>
                      </a>
                    </div>
                  </div>
                  <div className="mb-2 row">
                    <label className="col-lg-8 col-form-label col-form-label-sm">Subir plantilla EEFF</label>
                    <div className="col-lg-4">
                      <button 
                        type="button" 
                        className="btn btn-light-primary btn-sm float-end"
                        onClick={() => document.getElementById('fileUpload')?.click()}
                      >
                        <i className="fa-solid fa-file-import"></i>
                      </button>
                      <input 
                        id="fileUpload"
                        type="file" 
                        className="d-none"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData(prev => ({ ...prev, fileUsername: file.name }));
                          }
                        }}
                      />
                    </div>
                  </div>
                  {formData.fileUsername && (
                    <div className="mb-2 row" id="fileUsernameAlert">
                      <div className="col-lg-12 mt-2">
                        <div className="alert alert-success d-flex align-items-center py-2" role="alert">
                          <i className="fa-regular fa-circle-check me-2 fs-5 text-success"></i>
                          <div className="fs-8">
                            Plantilla cargada: {formData.fileUsername}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <FormInput 
                    label="Acciones" 
                    name="action" 
                    value={formData.action} 
                    onChange={handleInputChange}
                    placeholder="Número de acciones"
                  />
                </FormSection>

                <div className="card-footer px-2 py-2">
                  <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
                    {loading ? 'CALCULANDO...' : 'CALCULAR'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Desktop Toggle */}
        <button 
          className="aside-toggle d-none d-lg-flex"
          onClick={() => setIsAsideMinimized(!isAsideMinimized)}
        >
          <span className="svg-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect opacity="0.5" x="6" y="11" width="13" height="2" rx="1" fill="currentColor" />
              <path d="M8.56569 11.4343L12.75 7.25C13.1642 6.83579 13.1642 6.16421 12.75 5.75C12.3358 5.33579 11.6642 5.33579 11.25 5.75L5.70711 11.2929C5.31658 11.6834 5.31658 12.3166 5.70711 12.7071L11.25 18.25C11.6642 18.6642 12.3358 18.6642 12.75 18.25C13.1642 17.8358 13.1642 17.1642 12.75 16.75L8.56569 12.5657C8.25327 12.2533 8.25327 11.7467 8.56569 11.4343Z" fill="currentColor" />
            </svg>
          </span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className={`main-content ${isAsideMinimized ? 'aside-minimized' : ''}`}>
        {/* Navbar - Only shown when results are displayed */}
          <div className="results-navbar bg-white shadow-sm mb-3 py-2 px-3">
            <div className="container-xxl">
              <Navbar 
                uid={projectUid} 
                selected={getSelectedView()} 
                onNavigate={(view) => {
                  if (view === 'result') {
                    handleShowResults();
                  } else if (view === 'analysis') {
                    handleShowAnalysis();
                  } else if (view === 'methodology') {
                    handleShowMethodology();
                  }
                }}
                onOpenReport={handleOpenReportDrawer}
              />
            </div>
          </div>

        <div className="container-xxl">
          {loading && (
            <div className="table-loading">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <div className="mt-3 fs-6">Calculando valoración...</div>
            </div>
          )}

          {!loading && !showResults && !showAnalysis && (
            <div className="row">
              <div className="col-12">
                <div className="bs-panel-2">
                  <i className="fa-solid fa-building text-primary" style={{ fontSize: '3rem' }} />
                  <h2 className="fs-5">Completa los datos de la empresa y presiona valorar para obtener resultados</h2>
                  <button type="button" className="btn btn-primary btn-sm" disabled>VALORAR EMPRESA</button>
                </div>
              </div>
            </div>
          )}

          {/* RESULTS VIEW */}
          {!loading && showResults && results && (
            <div className="results-container ms-4">
     
              {/* Método por Conceptos */}
              <div className="col-lg-12 mb-3">
                <div className="card shadow-sm">
                  <div className="card-header bg-light py-4">
                    <div className="container my-auto">
                      <div className="row">
                        <div className="col">
                          <i className="fa-solid fa-triangle-exclamation fs-5"></i>
                        </div>
                        <div className="col text-center">
                          <h3 className='fs-6'>MÉTODO POR CONCEPTOS</h3>
                        </div>
                        <div className="col text-end">
                          <i className="fa-solid fa-circle-info fs-5" title="Valoración mediante proyección de componentes del FCE"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col">
                        <ul className="list-group list-group-flush mb-10">
                          <ResultValueCard 
                            title="VALOR DEL PATRIMONIO" 
                            value={formatter(results.concept.patrimony)} 
                            colorClass="text-success"
                          />
                          <ResultValueCard 
                            title="VALOR DE EMPRESA" 
                            value={formatter(results.concept.company)} 
                            colorClass="text-danger"
                          />
                          <ResultValueCard 
                            title="VALOR POR ACCIÓN" 
                            value={formatter(results.concept.action)} 
                            colorClass="text-primary"
                          />
                        </ul>
                      </div>
                      <div className="col">
                        <h3 className="mb-5 fs-5">Balance General Contable</h3>
                        <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                          <BalanceSheetBlock 
                            patrimony={formatter(results.concept.patrimony)}
                            deuda={formatter(results.concept.company - results.concept.patrimony)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Método Integrado */}
              <div className="col-lg-12 mb-3">
                <div className="card shadow-sm">
                  <div className="card-header bg-light">
                    <div className="container my-auto">
                      <div className="row">
                        <div className="col">
                          <i className="fa-solid fa-chart-pie fs-5"></i>
                        </div>
                        <div className="col text-center">
                          <h3 className='fs-6'>MÉTODO INTEGRADO</h3>
                        </div>
                        <div className="col text-end">
                          <i className="fa-solid fa-circle-info fs-5" title="Valoración mediante proyección histórica del FCO"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col">
                        <ul className="list-group list-group-flush mb-10">
                          <ResultValueCard 
                            title="VALOR DEL PATRIMONIO" 
                            value={formatter(results.integrated.patrimony)} 
                            colorClass="text-success"
                          />
                          <ResultValueCard 
                            title="VALOR DE EMPRESA" 
                            value={formatter(results.integrated.company)} 
                            colorClass="text-danger"
                          />
                          <ResultValueCard 
                            title="VALOR POR ACCIÓN" 
                            value={formatter(results.integrated.action)} 
                            colorClass="text-primary"
                          />
                        </ul>
                      </div>
                      <div className="col">
                        <h3 className="mb-5 fs-5">Balance General Contable</h3>
                        <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                          <BalanceSheetBlock 
                            patrimony={formatter(results.integrated.patrimony)}
                            deuda={formatter(results.integrated.company - results.integrated.patrimony)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cotización BVL */}
              <div className="col-lg-12">
                <div className="card shadow-sm mb-5">
                  <div className="card-header bg-light-primary">
                    <div className="container my-auto">
                      <div className="row">
                        <div className="col">
                          <i className="fa-solid fa-arrow-up-right-from-square fs-5"></i>
                        </div>
                        <div className="col text-center">
                          <h3 className='fs-6'>COTIZACIÓN EN BVL</h3>
                        </div>
                        <div className="col text-end">
                          <i className="fa-solid fa-circle-info fs-5" title="Comparación con valores de mercado"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body bg-light-primary bg-opacity-50 ">
                    {loadingBVL ? (
                      <div className="col-lg-12 table-loading mt-1">
                        <div className="table-loading-message">Cargando...</div>
                      </div>
                    ) : (
                      <div className="row">
                        <div className="col">
                          <div className="container mb-10">
                            <form>
                              <div className="mb-3 row mx-3">
                                <label htmlFor="inputCompany" className="col-4 col-form-label">Empresa</label>
                                <select 
                                  className="form-select form-select-lg" 
                                  id="inputCompany"
                                  onChange={handleCompanyChange}
                                >
                                  <option value="">Seleccione una empresa</option>
                                  {companies.map((company, index) => (
                                    <option key={index} value={index}>{company[0]}</option>
                                  ))}
                                </select>
                              </div>
                            </form>
                          </div>
                        </div>
                        <div className="col">
                          <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex  bg-light-primary ">
                              <h4>VALOR POR ACCIÓN</h4>
                              <div className="col text-end">
                                <h3 className="text-success fs-5">{selectedCompany?.action || '0.00'}</h3>
                              </div>
                            </li>
                            <li className="list-group-item d-flex  bg-light-primary">
                              <h4>CAPITALIZACIÓN BURSÁTIL</h4>
                              <div className="col text-end">
                                <h3 className="text-primary fs-5">{selectedCompany?.marketCap || '0.00'}</h3>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYSIS VIEW */}
          {!loading && showAnalysis && results && (
            <div className="analysis-container">
      

              {/* Form Card */}
              <div className="row mb-3">
                <div className="col-lg-12">
                  <form id="formAnalysisValora" onSubmit={handleAnalysisSubmit}>
                    <div className="row">
                      <div className="col-lg-4">
                        <div className="card shadow-sm mb-3">
                          <div className="card-body bg-secondary">
                            <label className="form-label">Tasa de crecimiento de largo plazo (g)</label>
                            <div className="input-group mb-3">
                              <input 
                                type="text" 
                                className="form-control text-center" 
                                value={analysisLongGrowth}
                                onChange={(e) => setAnalysisLongGrowth(e.target.value)}
                                required
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <div className="card shadow-sm mb-3">
                          <div className="card-body bg-secondary">
                            <label className="form-label">Costo de Capital (CPPC/WACC)</label>
                            <div className="input-group mb-3">
                              <input 
                                type="text" 
                                className="form-control text-center" 
                                value={analysisCapitalCost}
                                onChange={(e) => setAnalysisCapitalCost(e.target.value)}
                                required
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <div className="card shadow-sm mb-3">
                          <div className="card-body bg-secondary">
                            <label className="form-label">
                              Tasa de crecimiento de ingresos
                              <i className="fa-solid fa-circle-info fs-6 float-end mt-1 ms-2" title="Tasa de crecimiento para el primer año de proyección"></i>
                            </label>
                            <div className="input-group mb-3">
                              <input 
                                type="text" 
                                className="form-control text-center" 
                                value={analysisRevenueGrowth}
                                onChange={(e) => setAnalysisRevenueGrowth(e.target.value)}
                                required
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-end mb-3">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        Recalcular
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Results Cards */}
              <div className="row">
                {/* Método por Conceptos */}
                <div className="col-lg-12 mb-3">
                  <div className="card shadow-sm">
                    <div className="card-header bg-light py-4">
                      <div className="text-center">
                        <h3>MÉTODO POR CONCEPTOS</h3>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col">
                          <ul className="list-group list-group-flush">
                            <li className="list-group-item">
                              <div className="row">
                                <div className="col"><h4>VALOR DEL PATRIMONIO</h4></div>
                               
                              </div>
                            </li>
                            <li className="list-group-item">
                              <div className="row">
                                <div className="col"><h4>VALOR POR ACCIÓN</h4></div>
                               
                              </div>
                            </li>
                          </ul>
                        </div>
                        <div className="col text-center">
                          <h3 className="mb-5 fs-5">Balance General Contable</h3>
                          <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                            <BalanceSheetBlock 
                              patrimony={formatter(results.concept.patrimony)}
                              deuda={formatter(results.concept.company - results.concept.patrimony)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Método Integrado */}
                <div className="col-lg-12 mb-3">
                  <div className="card shadow-sm">
                    <div className="card-header bg-light">
                      <div className="text-center">
                        <h3>MÉTODO INTEGRADO</h3>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col">
                          <ul className="list-group list-group-flush">
                            <li className="list-group-item ">
                              <div className="row">
                                <div className="col"><h4>VALOR DEL PATRIMONIO</h4></div>
                               
                              </div>
                            </li>
                            <li className="list-group-item ">
                              <div className="row">
                                <div className="col"><h4>VALOR POR ACCIÓN</h4></div>
                                
                              </div>
                            </li>
                          </ul>
                        </div>
                        <div className="col text-center">
                          <h3 className="mb-5">Balance General Contable</h3>
                          <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                            <BalanceSheetBlock 
                              patrimony={formatter(results.integrated.patrimony)}
                              deuda={formatter(results.integrated.company - results.integrated.patrimony)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
          
        </div>

        {/* FOOTER */}
        <footer className="bg-light-success mt-4 p-3 pb-5">
          <div className="container-xxl">
            <div className="row g-3">
              <div className="col-lg-6">
                <h2 className="fs-6"><i className="fa-regular fa-building me-2" /> Valora</h2>
                <p className="fs-8 mb-0">Obtén una valoración precisa y confiable para tomar decisiones informadas de inversión.</p>
              </div>
              <div className="col-lg-6">
                <h2 className="fs-6"><i className="fa-solid fa-square-poll-vertical me-2" /> Suscríbete</h2>
                <p className="fs-8 mb-2">Suscríbete ahora para estar al tanto de lo último en finanzas, como webinars, noticias y ofertas.</p>
                <form onSubmit={(e) => { e.preventDefault(); alert(`Suscripción: ${email}`); setEmail(''); }}>
                  <div className="input-group input-group-sm">
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="Tu email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                    <button type="submit" className="btn btn-primary">Suscribirse</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
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

export default ValoraPage;