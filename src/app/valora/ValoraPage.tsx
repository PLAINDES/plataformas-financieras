import React, { useState } from 'react';
import "../kapital/KapitalPage.css"

interface FormData {
  date: string;
  country: string;
  currency: string;
  sector: string;
  fileUsername: string;
  action: string;
}

const ValoraPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    date: '',
    country: '',
    currency: '',
    sector: '',
    fileUsername: '',
    action: ''
  });

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAsideMinimized, setIsAsideMinimized] = useState(false);
  const [email, setEmail] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Sample data
  const dates = ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4'];
  const countries = ['Perú', 'Estados Unidos', 'Chile', 'Colombia', 'México'];
  const currencies = ['USD', 'PEN', 'EUR', 'CLP', 'COP', 'MXN'];
  const sectors = ['Tecnología', 'Finanzas', 'Manufactura', 'Servicios', 'Retail', 'Salud', 'Energía'];

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Calculando valoración...');
  };

  const handleSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscription email:', email);
    alert(`Suscripción enviada: ${email}`);
    setEmail('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, fileUsername: file.name }));
      setFileUploaded(true);
      setShowModal(false);
      alert(`Archivo cargado: ${file.name}`);
    }
  };

  const downloadTemplate = () => {
    // Simular descarga de plantilla
    alert('Descargando plantilla EEFF...');
  };

  return (
    <div className="kapital-page">
      {/* ASIDE - Sidebar */}
      <div className={`aside aside-extended ${isAsideMinimized ? 'minimized' : ''}`}>
        {/* Primary sidebar */}
        <div className="aside-primary d-flex flex-column align-items-lg-center flex-row-auto">
          {/* Logo */}
          <div className="aside-logo d-none d-lg-flex flex-column align-items-center flex-column-auto py-10" id="kt_aside_logo">
            <a href="/valora">
              <img alt="Logo" src="/assets/media/images/logo-valora-small.png" className="h-35px" />
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
                    <a href="/valora/proyectos" className="menu-link px-5">Mis proyectos</a>
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
          <div className="aside-workspace " id="kt_aside_wordspace">
            <div className="d-flex  flex-column" >
              <div className="flex-column-fluid hover-scroll-y">
                <div className="tab-content p-3">
                  <div className="tab-pane fade active show" id="kt_aside_nav_tab_projects" role="tabpanel">
                    {/* FORM */}
                    <form className="formInputValora" onSubmit={handleSubmit}>
                      <div className="card shadow-none mb-5">
                        {/* Section 1: País */}
                        <div className="card-header p-0">
                          <div className="card-title">
                            <span className="badge bg-primary rounded-pill me-1">1</span>
                            <div className="ms-2 me-auto">
                              <div className="fw-bold">Ingrese inputs de su país</div>
                            </div>
                          </div>
                        </div>
                        <div className="card-body px-0 pb-0">
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
                            <label className="col-lg-4 col-form-label">País</label>
                            <div className="col-lg-8">
                              <select className="form-select" name="country" value={formData.country} onChange={handleInputChange} required>
                                <option value="">SELECCIONE</option>
                                {countries.map(item => <option key={item} value={item}>{item}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">Moneda</label>
                            <div className="col-lg-8">
                              <select className="form-select" name="currency" value={formData.currency} onChange={handleInputChange} required>
                                <option value="">SELECCIONE</option>
                                {currencies.map(item => <option key={item} value={item}>{item}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">Sector</label>
                            <div className="col-lg-8">
                              <select className="form-select" name="sector" value={formData.sector} onChange={handleInputChange} required>
                                <option value="">SELECCIONE</option>
                                {sectors.map(item => <option key={item} value={item}>{item}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Empresa */}
                        <div className="card-header px-0">
                          <div className="card-title">
                            <span className="badge bg-primary rounded-pill me-1">2</span>
                            <div className="ms-2 me-auto">
                              <div className="fw-bold">Ingrese inputs de su empresa</div>
                            </div>
                          </div>
                        </div>
                        <div className="card-body px-0 pb-0">
                          <div className="mb-3 row">
                            <label className="col-lg-8 col-form-label">Descargar plantilla EEFF</label>
                            <div className="col-lg-4">
                              <button 
                                type="button" 
                                className="btn btn-light-primary float-end"
                                onClick={downloadTemplate}
                              >
                                <i className="fa-solid fa-download"></i>
                              </button>
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-lg-8 col-form-label">
                              Subir plantilla EEFF
                              {!fileUploaded && (
                                <input 
                                  type="text" 
                                  name="fileUsername" 
                                  value="" 
                                  id="fileUsername" 
                                  style={{ opacity: 0, height: 0, width: 0 }} 
                                  required 
                                />
                              )}
                            </label>
                            <div className="col-lg-4">
                              <button 
                                type="button" 
                                className="btn btn-light-primary float-end"
                                onClick={() => setShowModal(true)}
                              >
                                <i className="fa-solid fa-file-import"></i>
                              </button>
                            </div>
                          </div>
                          {fileUploaded && (
                            <div className="mb-3 row" id="fileUsernameAlert">
                              <div className="col-lg-12 mt-2">
                                <div className="alert alert-success d-flex align-items-center" role="alert">
                                  <i className="fa-regular fa-circle-check me-2 fs-2 text-success"></i>
                                  <div>
                                    Plantilla cargada: {formData.fileUsername}
                                    <a href="#" download title="Descargar plantilla cargada" id="fileUsernameUrl">
                                      <i className="fa-solid fa-file-arrow-down text-success fs-2 float-end" style={{ right: '22px', position: 'absolute' }}></i>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="mb-3 row">
                            <label className="col-lg-4 col-form-label">Acciones</label>
                            <div className="col-lg-8">
                              <input 
                                type="text" 
                                className="form-control" 
                                value={formData.action} 
                                name="action"
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="card-footer px-0 pb-0">
                          <button type="submit" className="btn btn-primary w-100">CALCULAR</button>
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
        <div className="d-flex flex-column flex-column-fluid mt-5">
          <div id="kt_app_content" className="app-content flex-column-fluid mb-0">
            <div id="kt_app_content_container" className="container-fluid">
              <div className="row">
                <div className="col-lg-12">
                  <div className="d-flex justify-content-center mt-15">
                    <div className="col-lg-8">
                      <div className="bs-panel-2">
                        <i className="fa-solid fa-calculator text-primary"></i>
                        <h2>Completa los inputs y presionas calcular para generar resultados instantáneos</h2>
                        <button type="button" className="btn btn-primary" disabled>VALORA</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div id="kt_app_footer" className="bg-light-success mt-5">
          <div className="app-container container-xxl d-flex flex-column py-10">
            <div className="row">
              <div className="col-lg-5 mb-10">
                <h2><i className="fa-regular fa-building me-2"></i> {footerData[0].content_name}</h2>
                <div className="text-dark mb-3" dangerouslySetInnerHTML={{ __html: footerData[0].content_description }}></div>
              </div>
              <div className="col-lg-2"></div>
              <div className="col-lg-5 mb-10">
                <h2><i className="fa-solid fa-square-poll-vertical me-2"></i> {footerData[1].content_name}</h2>
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

      {/* Modal para subir archivo */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Subir Plantilla EEFF</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input 
                  type="file" 
                  className="form-control" 
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValoraPage;