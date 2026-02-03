import React, { useState, useEffect } from 'react';
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

const KapitalPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    date: '',
    sector: '',
    instrument: '',
    bono: '',
    country: '',
    devaluation: '',
    tax: '',
    typeId: false,
    currency: 'USD',
    kd: '',
    debt: '',
    capital: '',
    useFinancialData: false,
    dc_ratio: '',
    effective_tax_rate: '',
    beta_levered: '',
    beta_unlevered: ''
  });

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAsideMinimized, setIsAsideMinimized] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [resultCurrency, setResultCurrency] = useState<'pen' | 'usd'>('pen');

  // Sample data
  const dates = ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4'];
  const sectors = ['Tecnología', 'Finanzas', 'Manufactura', 'Servicios', 'Retail'];
  const instruments = ['Bonos del Tesoro', 'Bonos Corporativos', 'Letras del Tesoro'];
  const bonos = ['2025', '2026', '2027', '2028', '2029', '2030'];
  const countries = ['Perú', 'Estados Unidos', 'Chile', 'Colombia', 'México'];
  const currencies = ['USD', 'PEN', 'EUR'];

  // User data
  const user = {
    name: 'Usuario',
    lastname: 'Demo',
    email: 'usuario@demo.com',
    perfil: 1
  };

  // Footer data
  const footerData = [
    {
      content_name: 'Valora tu Empresa',
      content_description: 'Obtén una evaluación precisa y confiable para tomar decisiones informadas. <br/> <a href="/valora">Evalúa el verdadero valor de tu empresa con nuestra plataforma de valoración financiera</a>'
    },
    {
      content_name: 'Suscríbete a Nuestro Newsletter',
      content_description: 'Recibe las últimas actualizaciones y consejos financieros directamente en tu correo.'
    }
  ];

  // Format percentage
  const formatterx100p = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // Auto-calculate capital percentage
  useEffect(() => {
    if (formData.debt) {
      const debtPercent = parseFloat(formData.debt) || 0;
      const capitalPercent = 100 - debtPercent;
      setFormData(prev => ({ ...prev, capital: capitalPercent.toFixed(2) }));
    }
  }, [formData.debt]);

  // Initialize charts (placeholder - you'll need a charting library like Chart.js or Recharts)
  useEffect(() => {
    if (showResults && results) {
      // Initialize charts here
      // For typeId === false (industry comparison):
      // - bsGroup1 (emergent market chart)
      // - bsGroup2 (developed market chart)
      // For typeId === true (company + markets):
      // - bsGroupCard1 (company chart)
      // - bsGroupCard2 (developed chart)
      // - bsGroupCard3 (emergent chart)
    }
  }, [showResults, results]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock results - replace with actual API call
      const mockResults: Results = {
        cppc: 0.0856,
        kd: 0.0654,
        ke: 0.0923,
        koa: 0.0789,
        emergent: {
          cppc: 0.0912,
          kd: 0.0701,
          ke: 0.0987,
          koa: 0.0834
        },
        developed: {
          cppc: 0.0745,
          kd: 0.0589,
          ke: 0.0821,
          koa: 0.0698
        }
      };
      
      setResults(mockResults);
      setLoading(false);
      setShowResults(true);
    }, 1500);
  };

  const handleSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscription email:', email);
    alert(`Suscripción enviada: ${email}`);
    setEmail('');
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setResultCurrency(e.target.value as 'pen' | 'usd');
    // Recalculate results based on currency if needed
  };

  return (
    <div className="kapital-page">
      {/* ASIDE - Sidebar */}
      <div className={`aside aside-extended ${isAsideMinimized ? 'minimized' : ''}`}>
        {/* Primary sidebar */}
        <div className="aside-primary d-flex flex-column align-items-lg-center flex-row-auto">
          {/* Logo */}
          <div className="aside-logo d-none d-lg-flex flex-column align-items-center flex-column-auto py-10" id="kt_aside_logo">
            <a href="/kapital">
              <img alt="Logo" src="/assets/media/images/logo-kapital-small.png" className="h-35px" />
            </a>
          </div>

          {/* Nav */}
          <div className="aside-nav d-flex flex-column align-items-center flex-column-fluid w-100 pt-5 pt-lg-0" id="kt_aside_nav">
            <div className="hover-scroll-overlay-y mb-5 px-5">
              <ul className="nav flex-column w-100" id="kt_aside_nav_tabs">
                <li className="nav-item mb-2" data-bs-toggle="tooltip" title="Formulario" id="kt_aside_item_projects">
                  <a className="nav-link btn btn-icon btn-active-color-primary btn-color-gray-400 btn-active-light active" data-bs-toggle="tab" href="#kt_aside_nav_tab_projects">
                    <span className="svg-icon svg-icon-2x">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          {/* Footer - User Menu */}
          <div className="aside-footer d-flex flex-column align-items-center flex-column-auto" id="kt_aside_footer">
            <div className="d-flex align-items-center mb-10 position-relative" id="kt_header_user_menu_toggle">
              <div 
                className="cursor-pointer symbol symbol-40px" 
                onClick={() => setShowUserMenu(!showUserMenu)}
                data-bs-toggle="tooltip" 
                data-bs-placement="right" 
                title="Mi perfil"
              >
                <img src="/assets/metronic/media/avatars/blank.png" alt="perfil" />
              </div>

              {showUserMenu && (
                <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px show">
                  <div className="menu-item px-3">
                    <div className="menu-content d-flex align-items-center px-3">
                      <div className="d-flex flex-column ps-3">
                        <div className="fw-bold d-flex align-items-center fs-5">
                          {user.name} {user.lastname}
                          <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">
                            <i className="fa-solid fa-check text-success"></i>
                          </span>
                        </div>
                        <a href="#" className="fw-semibold text-muted text-hover-primary fs-7">{user.email}</a>
                      </div>
                    </div>
                  </div>
                  <div className="menu-item px-5">
                    <a href="/kapital/proyectos" className="menu-link px-5">Mis proyectos</a>
                  </div>
                  {(user.perfil === 1 || user.perfil === 2) && (
                    <div className="menu-item px-5">
                      <a href="/admin" className="menu-link px-5">Administrador</a>
                    </div>
                  )}
                  <div className="separator my-2"></div>
                  <div className="menu-item px-5">
                    <a href="/auth/signout" className="menu-link px-5">Cerrar sesión</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary sidebar - Form */}
        <div className="aside-secondary d-flex flex-row-fluid">
          <div className="aside-workspace" id="kt_aside_wordspace">
            <div className="d-flex flex-column">
              <div className="flex-column-fluid hover-scroll-y">
                <div className="tab-content p-3">
                  <div className="tab-pane fade active show" id="kt_aside_nav_tab_projects" role="tabpanel">
                    {/* FORM */}
                    <form className="formWACC" id="waccForm" onSubmit={handleSubmit}>
                      <div className="card shadow-none mb-5">
                        {/* Section 1 */}
                        <div className="card-header px-2">
                          <div className="card-title">
                            <span className="badge bg-primary rounded-pill me-1 fs-3 px-3">1</span>
                            <div className="ms-2 me-auto">
                              <div className="fw-bold">Ingrese inputs de la industria</div>
                            </div>
                          </div>
                        </div>
                        <div className="card-body px-2 pb-0">
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">Fecha</label>
                            <div className="col-lg-8">
                              <select className="form-select" name="date" value={formData.date} onChange={handleInputChange} required>
                                <option value="">SELECCIONE</option>
                                {dates.map(item => <option key={item} value={item}>{item}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">Industria</label>
                            <div className="col-lg-8">
                              <select className="form-select" name="sector" value={formData.sector} onChange={handleInputChange} required>
                                <option value="">SELECCIONE</option>
                                {sectors.map(item => <option key={item} value={item}>{item}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">Tasa libre de riesgo</label>
                            <div className="col-lg-8">
                              <select className="form-select" name="instrument" value={formData.instrument} onChange={handleInputChange} required>
                                <option value="">SELECCIONE</option>
                                {instruments.map(item => <option key={item} value={item}>{item}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">Año del bono</label>
                            <div className="col-lg-8">
                              <select className="form-select" name="bono" value={formData.bono} onChange={handleInputChange} required>
                                <option value="">SELECCIONE</option>
                                {bonos.map(item => <option key={item} value={item}>{item}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Section 2 */}
                        <div className="card-header px-2 mt-2">
                          <div className="card-title">
                            <span className="badge bg-primary rounded-pill me-1 fs-3 px-3">2</span>
                            <div className="ms-2 me-auto">
                              <div className="fw-bold">Ingrese inputs del sector</div>
                            </div>
                          </div>
                        </div>
                        <div className="card-body px-2 pb-0">
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">País</label>
                            <div className="col-lg-8">
                              <select className="form-select" name="country" value={formData.country} onChange={handleInputChange} required>
                                <option value="">SELECCIONE</option>
                                {countries.map(item => <option key={item} value={item}>{item}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">Devaluación</label>
                            <div className="col-lg-8">
                              <div className="input-group">
                                <input type="text" className="form-control" name="devaluation" value={formData.devaluation} onChange={handleInputChange} />
                                <span className="input-group-text">%</span>
                              </div>
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">Tasa impositiva</label>
                            <div className="col-lg-8">
                              <div className="input-group">
                                <input type="text" className="form-control" name="tax" value={formData.tax} onChange={handleInputChange} />
                                <span className="input-group-text">%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 3 */}
                        <div className="card-header px-2 mt-5">
                          <div className="card-title">
                            <span className="badge bg-primary rounded-pill me-1 fs-3 px-3">3</span>
                            <div className="ms-2 me-auto lh-1">
                              <div className="fw-bold">
                                Ingrese inputs de su empresa
                                <label className="float-end ms-2">
                                  <i 
                                    className={`fa-solid ${formData.typeId ? 'fa-toggle-on' : 'fa-toggle-off'} fs-2 text-dark`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setFormData(prev => ({ ...prev, typeId: !prev.typeId }))}
                                  ></i>
                                </label>
                              </div>
                              <small>En caso no posea estos datos puede eliminarlos</small>
                            </div>
                          </div>
                        </div>
                        <div className={`card-body px-2 pb-0 collapse ${formData.typeId ? 'show' : ''}`}>
                          <div className="mb-3 row">
                            <label className="col-lg-12 col-form-label">Costo de deuda</label>
                            <div className="col-lg-12">
                              <div className="input-group">
                                <select className="input-group-text" name="currency" value={formData.currency} onChange={handleInputChange} style={{ width: '120px' }}>
                                  {currencies.map(item => <option key={item} value={item}>{item}</option>)}
                                </select>
                                <input type="text" className="form-control companyInput" name="kd" placeholder="Escriba su Kd" value={formData.kd} onChange={handleInputChange} required={formData.typeId} />
                                <span className="input-group-text">%</span>
                              </div>
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">Porcentaje de deuda</label>
                            <div className="col-lg-8">
                              <div className="input-group">
                                <input type="text" className="form-control companyInput" name="debt" value={formData.debt} onChange={handleInputChange} required={formData.typeId} />
                                <span className="input-group-text">%</span>
                              </div>
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">Porcentaje de capital</label>
                            <div className="col-lg-8">
                              <div className="input-group">
                                <input type="text" className="form-control companyInput" name="capital" value={formData.capital} onChange={handleInputChange} required={formData.typeId} readOnly />
                                <span className="input-group-text">%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 4 */}
                        <div className="card-header px-2 mt-5">
                          <div className="card-title">
                            <span className="badge bg-primary rounded-pill me-1 fs-3 px-3">4</span>
                            <div className="ms-2 me-auto lh-1">
                              <div className="fw-bold">
                                Datos financieros optimizados
                                <label className="float-end ms-2">
                                  <i 
                                    className={`fa-solid ${formData.useFinancialData ? 'fa-toggle-on' : 'fa-toggle-off'} fs-2 text-dark`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setFormData(prev => ({ ...prev, useFinancialData: !prev.useFinancialData }))}
                                  ></i>
                                </label>
                              </div>
                              <small>Datos que pueden ser completados automáticamente por el asistente IA</small>
                            </div>
                          </div>
                        </div>
                        <div className={`card-body px-2 pb-0 collapse ${formData.useFinancialData ? 'show' : ''}`}>
                          <div className="alert alert-info d-flex align-items-center mb-3">
                            <i className="fas fa-info-circle me-2"></i>
                            <div>
                              <strong>Sugerencia:</strong> Use el chatbot de análisis financiero para obtener estos datos automáticamente basados en empresas comparables del sector.
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">
                              D/C Ratio
                              <i className="fas fa-info-circle ms-1" title="Ratio Deuda/Capital: Proporción de deuda respecto al capital total"></i>
                            </label>
                            <div className="col-lg-8">
                              <div className="input-group">
                                <input type="text" className="form-control financialInput" name="dc_ratio" placeholder="Ej: 0.35" value={formData.dc_ratio} onChange={handleInputChange} />
                                <span className="input-group-text">decimal</span>
                              </div>
                              <div className="form-text">Ingrese como decimal (ej: 0.35 para 35%)</div>
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">
                              Tasa Efectiva de Impuesto
                              <i className="fas fa-info-circle ms-1" title="Tasa real de impuestos que paga la empresa"></i>
                            </label>
                            <div className="col-lg-8">
                              <div className="input-group">
                                <input type="text" className="form-control financialInput" name="effective_tax_rate" placeholder="Ej: 25.5" value={formData.effective_tax_rate} onChange={handleInputChange} />
                                <span className="input-group-text">%</span>
                              </div>
                              <div className="form-text">Tasa efectiva real de impuestos de la empresa</div>
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">
                              Beta Apalancado
                              <i className="fas fa-info-circle ms-1" title="Beta que incluye el riesgo financiero de la estructura de capital"></i>
                            </label>
                            <div className="col-lg-8">
                              <div className="input-group">
                                <input type="text" className="form-control financialInput" name="beta_levered" placeholder="Ej: 1.25" value={formData.beta_levered} onChange={handleInputChange} />
                                <span className="input-group-text">coef.</span>
                              </div>
                              <div className="form-text">Beta que refleja el riesgo financiero y operativo</div>
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">
                              Beta Desapalancado
                              <i className="fas fa-info-circle ms-1" title="Beta que refleja solo el riesgo operativo, sin apalancamiento financiero"></i>
                            </label>
                            <div className="col-lg-8">
                              <div className="input-group">
                                <input type="text" className="form-control financialInput" name="beta_unlevered" placeholder="Ej: 0.95" value={formData.beta_unlevered} onChange={handleInputChange} />
                                <span className="input-group-text">coef.</span>
                              </div>
                              <div className="form-text">Beta sin riesgo financiero, solo riesgo del negocio</div>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="card-footer px-2 pb-0">
                          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? 'CALCULANDO...' : 'CALCULA TU WACC'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aside Toggle */}
        <button 
          id="kt_aside_toggle" 
          className="aside-toggle btn btn-sm btn-icon bg-body btn-color-gray-700 btn-active-primary position-absolute translate-middle start-100 end-0 shadow-sm d-none d-lg-flex mb-5"
          onClick={() => setIsAsideMinimized(!isAsideMinimized)}
          style={{ top: '92px' }}
        >
          <span className="svg-icon svg-icon-2 rotate-180">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect opacity="0.5" x="6" y="11" width="13" height="2" rx="1" fill="currentColor" />
              <path d="M8.56569 11.4343L12.75 7.25C13.1642 6.83579 13.1642 6.16421 12.75 5.75C12.3358 5.33579 11.6642 5.33579 11.25 5.75L5.70711 11.2929C5.31658 11.6834 5.31658 12.3166 5.70711 12.7071L11.25 18.25C11.6642 18.6642 12.3358 18.6642 12.75 18.25C13.1642 17.8358 13.1642 17.1642 12.75 16.75L8.56569 12.5657C8.25327 12.2533 8.25327 11.7467 8.56569 11.4343Z" fill="currentColor" />
            </svg>
          </span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className={`main-content ${isAsideMinimized ? 'aside-minimized' : ''}`}>
        <div className="container-xxl" id="kt_content_container">
          {/* Loading State */}
          {loading && (
            <div className="col-lg-12 table-loading mt-3">
              <div className="table-loading-message">
                Cargando...
              </div>
            </div>
          )}

          {/* Initial State - Before calculation */}
          {!loading && !showResults && (
            <div className="row gy-5 g-xl-8">
              <div className="col-lg-12">
                <div className="d-flex justify-content-center mt-15">
                  <div className="col-lg-8">
                    <div className="card shadow-sm bs-panel-2">
                      <i className="fa-solid fa-calculator text-primary"></i>
                      <h2>Completa los inputs y presiona calcular para generar resultados instantáneos</h2>
                      <button type="button" className="btn btn-primary" disabled>CALCULA TU WACC</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results - After calculation */}
          {!loading && showResults && results && (
            <div className="row gy-5 g-xl-8">
              <div className="col-lg-12">
                <div className="bs-container-title">
                  <div className="row">
                    <div className="col-lg-8 mb-2">
                      <h1 className="fs-1">Resultados generales</h1>
                      <span className="fs-5">Comparación de resultados</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type 1: Industry Comparison (typeId === false) */}
              {!formData.typeId && (
                <div className="col-lg-12 mt-3">
                  {/* Emergent Market */}
                  <div className="card bs-panel-3 shadow-sm mb-4">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-lg-8 border-end border-bottom border-secondary">
                          <div className="panel-side">
                            <h3 className="mb-7">Resultados del mercado emergente</h3>
                            <div className="mb-2" id="bsGroup1" style={{ height: '250px', width: '300px', margin: 'auto' }}>
                              {/* Chart placeholder - use a charting library */}
                              <div className="d-flex align-items-center justify-content-center h-100">
                                <span className="text-muted">Gráfico del mercado emergente</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="row">
                            <div className="col-lg-12 border-bottom border-secondary">
                              <div className="panel-header">
                                <h2>{formatterx100p(results.emergent.cppc)}</h2>
                                <span className="lh-1">Costo promedio de capital (CPPC)</span>
                              </div>
                            </div>
                            <div className="col-lg-12 border-bottom border-secondary">
                              <div className="panel-body">
                                <div className="panel-item">
                                  <div className="panel-icon bs-fa-green">
                                    <i className="fa-solid fa-arrow-trend-up"></i>
                                  </div>
                                  <div className="d-flex justify-content-start flex-column">
                                    <strong>{formatterx100p(results.emergent.kd)}</strong>
                                    <span className="text-gray-400 fw-semibold d-block fs-7 lh-1">
                                      Costo de deuda después de impuestos (Kd*(1-T))
                                    </span>
                                  </div>
                                </div>
                                <div className="panel-item">
                                  <div className="panel-icon bs-fa-blue">
                                    <i className="fa-regular fa-user"></i>
                                  </div>
                                  <div className="d-flex justify-content-start flex-column">
                                    <strong>{formatterx100p(results.emergent.ke)}</strong>
                                    <span className="text-gray-400 fw-semibold d-block fs-7 lh-1">
                                      Costo de capital financiero (Ke)
                                    </span>
                                  </div>
                                </div>
                                <div className="panel-item">
                                  <div className="panel-icon bs-fa-light">
                                    <i className="fa-solid fa-laptop"></i>
                                  </div>
                                  <div className="d-flex justify-content-start flex-column">
                                    <strong>{formatterx100p(results.emergent.koa)}</strong>
                                    <span className="text-gray-400 fw-semibold d-block fs-7 lh-1">
                                      Costo de cápital económico (Koa)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Developed Market */}
                  <div className="card bs-panel-3 shadow-sm">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-lg-8 border-end border-bottom border-secondary">
                          <div className="panel-side">
                            <h3 className="mb-7">Resultados del mercado desarrollado</h3>
                            <div className="mb-2" id="bsGroup2" style={{ height: '250px', width: '300px', margin: 'auto' }}>
                              {/* Chart placeholder */}
                              <div className="d-flex align-items-center justify-content-center h-100">
                                <span className="text-muted">Gráfico del mercado desarrollado</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="row">
                            <div className="col-lg-12 border-bottom border-secondary">
                              <div className="panel-header">
                                <h2>{formatterx100p(results.developed.cppc)}</h2>
                                <span className="lh-1">Costo promedio de capital (CPPC)</span>
                              </div>
                            </div>
                            <div className="col-lg-12 border-bottom border-secondary">
                              <div className="panel-body">
                                <div className="panel-item">
                                  <div className="panel-icon bs-fa-green">
                                    <i className="fa-solid fa-arrow-trend-up"></i>
                                  </div>
                                  <div className="d-flex justify-content-start flex-column">
                                    <strong>{formatterx100p(results.developed.kd)}</strong>
                                    <span className="text-gray-400 fw-semibold d-block fs-7 lh-1">
                                      Costo de deuda después de impuestos (Kd*(1-T))
                                    </span>
                                  </div>
                                </div>
                                <div className="panel-item">
                                  <div className="panel-icon bs-fa-blue">
                                    <i className="fa-regular fa-user"></i>
                                  </div>
                                  <div className="d-flex justify-content-start flex-column">
                                    <strong>{formatterx100p(results.developed.ke)}</strong>
                                    <span className="text-gray-400 fw-semibold d-block fs-7 lh-1">
                                      Costo de capital financiero (Ke)
                                    </span>
                                  </div>
                                </div>
                                <div className="panel-item">
                                  <div className="panel-icon bs-fa-light">
                                    <i className="fa-solid fa-laptop"></i>
                                  </div>
                                  <div className="d-flex justify-content-start flex-column">
                                    <strong>{formatterx100p(results.developed.koa)}</strong>
                                    <span className="text-gray-400 fw-semibold d-block fs-7 lh-1">
                                      Costo de cápital económico (Koa)
                                    </span>
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
              )}

              {/* Type 2: Company + Markets Comparison (typeId === true) */}
              {formData.typeId && (
                <div className="col-lg-12 mt-3">
                  {/* Three Cards Row */}
                  <div className="row mb-4">
                    {/* Company Card */}
                    <div className="col">
                      <div className={`card bs-panel-3 ${resultCurrency === 'usd' ? 'border-dolares' : 'border-soles'}`}>
                        <div className="card-header">
                          <h3 className="card-title">Empresa</h3>
                          <div className="col-lg-4 my-2">
                            <div className="inline-block float-end">
                              <select className="form-select" value={resultCurrency} onChange={handleCurrencyChange}>
                                <option value="pen">PEN</option>
                                <option value="usd">USD</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-lg-12">
                              <div className="panel-side">
                                <div className="mb-7 px-20">
                                  <h2 className="fs-1">{formatterx100p(results.cppc)}</h2>
                                  <span className="lh-1">CPPC</span>
                                </div>
                                <div className="mb-5" id="bsGroupCard1" style={{ height: '200px', width: '250px', margin: 'auto' }}>
                                  {/* Chart placeholder */}
                                  <div className="d-flex align-items-center justify-content-center h-100">
                                    <span className="text-muted">Gráfico empresa</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Emergent Market Card */}
                    <div className="col">
                      <div className="card bs-panel-3">
                        <div className="card-header">
                          <h3 className="card-title">Mercado emergente</h3>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-lg-12">
                              <div className="panel-side">
                                <div className="mb-7 px-20">
                                  <h2 className="fs-1">{formatterx100p(results.emergent.cppc)}</h2>
                                  <span className="lh-1">CPPC</span>
                                </div>
                                <div className="mb-5" id="bsGroupCard3" style={{ height: '200px', width: '250px', margin: 'auto' }}>
                                  {/* Chart placeholder */}
                                  <div className="d-flex align-items-center justify-content-center h-100">
                                    <span className="text-muted">Gráfico emergente</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Developed Market Card */}
                    <div className="col">
                      <div className="card bs-panel-3">
                        <div className="card-header">
                          <h3 className="card-title">Mercado desarrollado</h3>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-lg-12">
                              <div className="panel-side">
                                <div className="mb-7 px-20">
                                  <h2 className="fs-1">{formatterx100p(results.developed.cppc)}</h2>
                                  <span className="lh-1">CPPC</span>
                                </div>
                                <div className="mb-5" id="bsGroupCard2" style={{ height: '200px', width: '250px', margin: 'auto' }}>
                                  {/* Chart placeholder */}
                                  <div className="d-flex align-items-center justify-content-center h-100">
                                    <span className="text-muted">Gráfico desarrollado</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Four Info Cards Row */}
                  <div className="row">
                    {/* CPPC Card */}
                    <div className="col">
                      <div className="card shadow-sm bs-card-a1" style={{ minHeight: '19rem' }}>
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fa-solid fa-file-lines"></i>
                          </h3>
                        </div>
                        <div className="card-body" style={{ minHeight: '90px' }}>
                          <span>Costo Promedio Ponderado de Capital (CPPC)</span><br />
                          El costo de las fuentes de capital que se utilizaron en financiar los activos de la firma.
                        </div>
                        <div className="card-footer">
                          <h2>{formatterx100p(results.cppc)}</h2>
                        </div>
                      </div>
                    </div>

                    {/* Kd Card */}
                    <div className="col">
                      <div className="card shadow-sm bs-card-a1" style={{ minHeight: '19rem' }}>
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fa-solid fa-pencil"></i>
                          </h3>
                        </div>
                        <div className="card-body" style={{ minHeight: '90px' }}>
                          <span>Costo de Deuda Después de Impuestos (Kd*(1-T))</span><br />
                          El costo de la deuda de los pasivos financieros que tienen la empresa.
                        </div>
                        <div className="card-footer">
                          <h2>{formatterx100p(results.kd)}</h2>
                        </div>
                      </div>
                    </div>

                    {/* Ke Card */}
                    <div className="col">
                      <div className="card shadow-sm bs-card-a1" style={{ minHeight: '19rem' }}>
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fa-solid fa-chart-column"></i>
                          </h3>
                        </div>
                        <div className="card-body" style={{ minHeight: '90px' }}>
                          <span>Costo de Capital Financiero (Ke)</span><br />
                          El rendimiento financiero esperado por los accionistas.
                        </div>
                        <div className="card-footer">
                          <h2>{formatterx100p(results.ke)}</h2>
                        </div>
                      </div>
                    </div>

                    {/* Koa Card */}
                    <div className="col">
                      <div className="card shadow-sm bs-card-a1" style={{ minHeight: '19rem' }}>
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fa-solid fa-signal"></i>
                          </h3>
                        </div>
                        <div className="card-body" style={{ minHeight: '90px' }}>
                          <span>Costo de Capital Económico (Koa)</span><br />
                          El rendimiento económico esperado de las inversiones.
                        </div>
                        <div className="card-footer">
                          <h2>{formatterx100p(results.koa)}</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div id="kt_app_footer" className="bg-light-success mt-5">
          <div className="app-container container-xxl d-flex flex-column py-10">
            <div className="row">
              <div className="col-lg-5 mb-10">
                <h2>
                  <i className="fa-regular fa-building me-2"></i> {footerData[0].content_name}
                </h2>
                <div className="text-dark mb-3" dangerouslySetInnerHTML={{ __html: footerData[0].content_description }}></div>
              </div>
              <div className="col-lg-2"></div>
              <div className="col-lg-5 mb-10">
                <h2>
                  <i className="fa-solid fa-square-poll-vertical me-2"></i> {footerData[1].content_name}
                </h2>
                <div className="text-dark mb-3">{footerData[1].content_description}</div>
                <div>
                  <form className="formSuscription" onSubmit={handleSubscription}>
                    <div className="d-flex mb-3">
                      <input 
                        type="email" 
                        name="email" 
                        className="form-control me-3" 
                        placeholder="Escriba acá su E-mail" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                      <button type="submit" className="btn btn-primary">Subscribirse</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KapitalPage;