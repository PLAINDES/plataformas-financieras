import React, { useState, useEffect } from 'react';
import './KapitalPage.css';

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
        <span className="badge bg-primary rounded-pill me-1 fs-3 px-3">{number}</span>
        <div className="ms-2 me-auto lh-1">
          <div className="fw-bold">
            {title}
            {toggle !== undefined && (
              <label className="float-end ms-2">
                <i 
                  className={`fa-solid ${toggle ? 'fa-toggle-on' : 'fa-toggle-off'} fs-2 text-dark`}
                  style={{ cursor: 'pointer' }}
                  onClick={onToggle}
                />
              </label>
            )}
          </div>
          {subtitle && <small>{subtitle}</small>}
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
  <div className="mb-3 row">
    <label className="col-lg-4 col-form-label">
      {label}
      {tooltip && <i className="fas fa-info-circle ms-1" title={tooltip} />}
    </label>
    <div className="col-lg-8">
      <div className={suffix ? 'input-group' : ''}>
        {type === 'select' ? (
          <select className="form-select" name={name} value={value} onChange={onChange} required={required}>
            <option value="">SELECCIONE</option>
            {options?.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        ) : (
          <input 
            type="text" 
            className="form-control" 
            name={name} 
            value={value} 
            onChange={onChange} 
            required={required}
            readOnly={readOnly}
            placeholder={placeholder}
          />
        )}
        {suffix && <span className="input-group-text">{suffix}</span>}
      </div>
      {name === 'dc_ratio' && <div className="form-text">Ingrese como decimal (ej: 0.35 para 35%)</div>}
      {name === 'effective_tax_rate' && <div className="form-text">Tasa efectiva real de impuestos de la empresa</div>}
      {name === 'beta_levered' && <div className="form-text">Beta que refleja el riesgo financiero y operativo</div>}
      {name === 'beta_unlevered' && <div className="form-text">Beta sin riesgo financiero, solo riesgo del negocio</div>}
    </div>
  </div>
);

// Component: Result Card
const ResultCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  value: string;
}> = ({ icon, title, description, value }) => (
  <div className="col">
    <div className="card shadow-sm bs-card-a1">
      <div className="card-header">
        <h3 className="card-title">
          <i className={icon} />
        </h3>
      </div>
      <div className="card-body">
        <span>{title}</span><br />
        {description}
      </div>
      <div className="card-footer">
        <h2>{value}</h2>
      </div>
    </div>
  </div>
);

// Main Component
const KapitalPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    date: '', sector: '', instrument: '', bono: '', country: '', devaluation: '',
    tax: '', typeId: false, currency: 'USD', kd: '', debt: '', capital: '',
    useFinancialData: false, dc_ratio: '', effective_tax_rate: '',
    beta_levered: '', beta_unlevered: ''
  });

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAsideMinimized, setIsAsideMinimized] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [resultCurrency, setResultCurrency] = useState<'pen' | 'usd'>('pen');

  const dates = ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4'];
  const sectors = ['Tecnología', 'Finanzas', 'Manufactura', 'Servicios', 'Retail'];
  const instruments = ['Bonos del Tesoro', 'Bonos Corporativos', 'Letras del Tesoro'];
  const bonos = ['2025', '2026', '2027', '2028', '2029', '2030'];
  const countries = ['Perú', 'Estados Unidos', 'Chile', 'Colombia', 'México'];
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
    setIsMobileMenuOpen(false); // Close mobile menu on submit
    
    setTimeout(() => {
      const mockResults: Results = {
        cppc: 0.0856, kd: 0.0654, ke: 0.0923, koa: 0.0789,
        emergent: { cppc: 0.0912, kd: 0.0701, ke: 0.0987, koa: 0.0834 },
        developed: { cppc: 0.0745, kd: 0.0589, ke: 0.0821, koa: 0.0698 }
      };
      setResults(mockResults);
      setLoading(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="kapital-page">
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`} />
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* ASIDE - Sidebar */}
      <div className={`aside ${isAsideMinimized ? 'minimized' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Primary sidebar */}
        <div className="aside-primary">
          <div className="aside-logo" id="kt_aside_logo">
            <a href="/kapital">
              <img alt="Logo" src="/assets/media/images/logo-kapital-small.png" className="h-35px" />
            </a>
          </div>

          <div className="aside-nav" id="kt_aside_nav">
            <div className="hover-scroll-overlay-y">
              <ul className="nav flex-column" id="kt_aside_nav_tabs">
                <li className="nav-item">
                  <a className="nav-link active">
                    <span className="svg-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
          </div>

          <div className="aside-footer">
            <div className="position-relative">
              <div className="cursor-pointer symbol" onClick={() => setShowUserMenu(!showUserMenu)}>
                <img src="/assets/metronic/media/avatars/blank.png" alt="perfil" />
              </div>

              {showUserMenu && (
                <div className="menu show">
                  <div className="menu-item px-3">
                    <div className="menu-content">
                      <div className="fw-bold">Usuario Demo</div>
                      <a href="#" className="text-muted">usuario@demo.com</a>
                    </div>
                  </div>
                  <div className="menu-item px-5">
                    <a href="/kapital/proyectos" className="menu-link">Mis proyectos</a>
                  </div>
                  <div className="separator" />
                  <div className="menu-item px-5">
                    <a href="/auth/signout" className="menu-link">Cerrar sesión</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary sidebar - Form */}
        <div className="aside-secondary">
          <div className="aside-workspace">
            <form className="formWACC p-3" onSubmit={handleSubmit}>
              <div className="card shadow-none mb-5">
                {/* Section 1: Industry */}
                <FormSection title="Ingrese inputs de la industria" number={1}>
                  <FormInput label="Fecha" name="date" type="select" value={formData.date} onChange={handleInputChange} options={dates} required />
                  <FormInput label="Industria" name="sector" type="select" value={formData.sector} onChange={handleInputChange} options={sectors} required />
                  <FormInput label="Tasa libre de riesgo" name="instrument" type="select" value={formData.instrument} onChange={handleInputChange} options={instruments} required />
                  <FormInput label="Año del bono" name="bono" type="select" value={formData.bono} onChange={handleInputChange} options={bonos} required />
                </FormSection>

                {/* Section 2: Sector */}
                <FormSection title="Ingrese inputs del sector" number={2}>
                  <FormInput label="País" name="country" type="select" value={formData.country} onChange={handleInputChange} options={countries} required />
                  <FormInput label="Devaluación" name="devaluation" value={formData.devaluation} onChange={handleInputChange} suffix="%" />
                  <FormInput label="Tasa impositiva" name="tax" value={formData.tax} onChange={handleInputChange} suffix="%" />
                </FormSection>

                {/* Section 3: Company */}
                <FormSection 
                  title="Ingrese inputs de su empresa" 
                  number={3}
                  subtitle="En caso no posea estos datos puede eliminarlos"
                  toggle={formData.typeId}
                  onToggle={() => setFormData(prev => ({ ...prev, typeId: !prev.typeId }))}
                >
                  <div className="mb-3 row">
                    <label className="col-lg-12 col-form-label">Costo de deuda</label>
                    <div className="col-lg-12">
                      <div className="input-group">
                        <select className="input-group-text" name="currency" value={formData.currency} onChange={handleInputChange} style={{ width: '100px' }}>
                          {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input type="text" className="form-control" name="kd" placeholder="Escriba su Kd" value={formData.kd} onChange={handleInputChange} required={formData.typeId} />
                        <span className="input-group-text">%</span>
                      </div>
                    </div>
                  </div>
                  <FormInput label="% de deuda" name="debt" value={formData.debt} onChange={handleInputChange} suffix="%" required={formData.typeId} />
                  <FormInput label="% de capital" name="capital" value={formData.capital} onChange={handleInputChange} suffix="%" required={formData.typeId} readOnly />
                </FormSection>

                {/* Section 4: Financial Data */}
                <FormSection 
                  title="Datos financieros optimizados" 
                  number={4}
                  subtitle="Datos que pueden ser completados automáticamente por el asistente IA"
                  toggle={formData.useFinancialData}
                  onToggle={() => setFormData(prev => ({ ...prev, useFinancialData: !prev.useFinancialData }))}
                >
                  <div className="alert alert-info d-flex align-items-center mb-3">
                    <i className="fas fa-info-circle me-2" />
                    <small><strong>Sugerencia:</strong> Use el chatbot de análisis financiero para obtener estos datos automáticamente.</small>
                  </div>
                  <FormInput label="D/C Ratio" name="dc_ratio" value={formData.dc_ratio} onChange={handleInputChange} suffix="decimal" placeholder="Ej: 0.35" tooltip="Ratio Deuda/Capital" />
                  <FormInput label="Tasa Efectiva Impuesto" name="effective_tax_rate" value={formData.effective_tax_rate} onChange={handleInputChange} suffix="%" placeholder="Ej: 25.5" tooltip="Tasa real de impuestos" />
                  <FormInput label="Beta Apalancado" name="beta_levered" value={formData.beta_levered} onChange={handleInputChange} suffix="coef." placeholder="Ej: 1.25" tooltip="Beta con riesgo financiero" />
                  <FormInput label="Beta Desapalancado" name="beta_unlevered" value={formData.beta_unlevered} onChange={handleInputChange} suffix="coef." placeholder="Ej: 0.95" tooltip="Beta sin riesgo financiero" />
                </FormSection>

                <div className="card-footer px-2">
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'CALCULANDO...' : 'CALCULA TU WACC'}
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
        <div className="container-xxl">
          {loading && (
            <div className="table-loading">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <div className="mt-3">Calculando resultados...</div>
            </div>
          )}

          {!loading && !showResults && (
            <div className="row">
              <div className="col-12">
                <div className="bs-panel-2">
                  <i className="fa-solid fa-calculator text-primary" />
                  <h2>Completa los inputs y presiona calcular para generar resultados instantáneos</h2>
                  <button type="button" className="btn btn-primary" disabled>CALCULA TU WACC</button>
                </div>
              </div>
            </div>
          )}

          {!loading && showResults && results && (
            <div className="results-container">
              <div className="bs-container-title">
                <h1 className="fs-1">Resultados generales</h1>
                <span className="fs-5">Comparación de resultados</span>
              </div>

              {formData.typeId ? (
                <>
                  {/* Company + Markets View */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className={`card bs-panel-3 ${resultCurrency === 'usd' ? 'border-dolares' : 'border-soles'}`}>
                        <div className="card-header">
                          <h3 className="card-title">Empresa</h3>
                          <select className="form-select form-select-sm" value={resultCurrency} onChange={(e) => setResultCurrency(e.target.value as any)} style={{ width: '100px' }}>
                            <option value="pen">PEN</option>
                            <option value="usd">USD</option>
                          </select>
                        </div>
                        <div className="card-body text-center">
                          <h2 className="fs-1 mb-2">{formatterx100p(results.cppc)}</h2>
                          <span>CPPC</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bs-panel-3">
                        <div className="card-header">
                          <h3 className="card-title">Mercado emergente</h3>
                        </div>
                        <div className="card-body text-center">
                          <h2 className="fs-1 mb-2">{formatterx100p(results.emergent.cppc)}</h2>
                          <span>CPPC</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bs-panel-3">
                        <div className="card-header">
                          <h3 className="card-title">Mercado desarrollado</h3>
                        </div>
                        <div className="card-body text-center">
                          <h2 className="fs-1 mb-2">{formatterx100p(results.developed.cppc)}</h2>
                          <span>CPPC</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <ResultCard icon="fa-solid fa-file-lines" title="CPPC" description="Costo Promedio Ponderado de Capital" value={formatterx100p(results.cppc)} />
                    <ResultCard icon="fa-solid fa-pencil" title="Kd*(1-T)" description="Costo de Deuda Después de Impuestos" value={formatterx100p(results.kd)} />
                    <ResultCard icon="fa-solid fa-chart-column" title="Ke" description="Costo de Capital Financiero" value={formatterx100p(results.ke)} />
                    <ResultCard icon="fa-solid fa-signal" title="Koa" description="Costo de Capital Económico" value={formatterx100p(results.koa)} />
                  </div>
                </>
              ) : (
                <>
                  {/* Market Comparison View */}
                  <div className="card bs-panel-3 mb-3">
                    <div className="card-body">
                      <h3 className="mb-3">Mercado emergente</h3>
                      <div className="row">
                        <div className="col-md-6 text-center mb-3">
                          <h2>{formatterx100p(results.emergent.cppc)}</h2>
                          <span>CPPC</span>
                        </div>
                        <div className="col-md-6">
                          <div className="panel-item">
                            <div className="panel-icon bs-fa-green"><i className="fa-solid fa-arrow-trend-up" /></div>
                            <div>
                              <strong>{formatterx100p(results.emergent.kd)}</strong>
                              <span className="d-block text-muted small">Kd*(1-T)</span>
                            </div>
                          </div>
                          <div className="panel-item">
                            <div className="panel-icon bs-fa-blue"><i className="fa-regular fa-user" /></div>
                            <div>
                              <strong>{formatterx100p(results.emergent.ke)}</strong>
                              <span className="d-block text-muted small">Ke</span>
                            </div>
                          </div>
                          <div className="panel-item">
                            <div className="panel-icon bs-fa-light"><i className="fa-solid fa-laptop" /></div>
                            <div>
                              <strong>{formatterx100p(results.emergent.koa)}</strong>
                              <span className="d-block text-muted small">Koa</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card bs-panel-3">
                    <div className="card-body">
                      <h3 className="mb-3">Mercado desarrollado</h3>
                      <div className="row">
                        <div className="col-md-6 text-center mb-3">
                          <h2>{formatterx100p(results.developed.cppc)}</h2>
                          <span>CPPC</span>
                        </div>
                        <div className="col-md-6">
                          <div className="panel-item">
                            <div className="panel-icon bs-fa-green"><i className="fa-solid fa-arrow-trend-up" /></div>
                            <div>
                              <strong>{formatterx100p(results.developed.kd)}</strong>
                              <span className="d-block text-muted small">Kd*(1-T)</span>
                            </div>
                          </div>
                          <div className="panel-item">
                            <div className="panel-icon bs-fa-blue"><i className="fa-regular fa-user" /></div>
                            <div>
                              <strong>{formatterx100p(results.developed.ke)}</strong>
                              <span className="d-block text-muted small">Ke</span>
                            </div>
                          </div>
                          <div className="panel-item">
                            <div className="panel-icon bs-fa-light"><i className="fa-solid fa-laptop" /></div>
                            <div>
                              <strong>{formatterx100p(results.developed.koa)}</strong>
                              <span className="d-block text-muted small">Koa</span>
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
        <footer className="bg-light-success mt-5 p-4">
          <div className="container-xxl">
            <div className="row g-4">
              <div className="col-lg-6">
                <h2><i className="fa-regular fa-building me-2" /> Valora tu Empresa</h2>
                <p>Obtén una evaluación precisa y confiable para tomar decisiones informadas.</p>
              </div>
              <div className="col-lg-6">
                <h2><i className="fa-solid fa-square-poll-vertical me-2" /> Suscríbete</h2>
                <form onSubmit={(e) => { e.preventDefault(); alert(`Suscripción: ${email}`); setEmail(''); }}>
                  <div className="input-group">
                    <input type="email" className="form-control" placeholder="Tu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <button type="submit" className="btn btn-primary">Subscribirse</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default KapitalPage;