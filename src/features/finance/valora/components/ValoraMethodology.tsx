import React, { useState, useEffect } from 'react';
import './ValoraPage.css';

interface Category {
  name: string;
  products: Product[];
}

interface Product {
  name: string;
  file: string;
}

// Component: Navbar (mismo que en ValoraPage pero con methodology seleccionado)
const Navbar: React.FC<{
  uid?: string;
  selected: 'result' | 'analysis' | 'methodology' | '';
}> = ({ uid, selected }) => (
  <div className="navbar-actions d-flex align-items-center">
    {uid && (
      <>
        <div className="d-flex ms-3">
          <a 
            href={`/valora/${uid}/resultados`}
            className={`btn btn-flex flex-center bg-body btn-color-gray-700 btn-active-color-primary w-40px w-md-auto h-40px px-0 px-md-6 ${selected === 'result' ? 'active' : ''}`}
            style={{ background: 'transparent', border: '1px solid #e4e6ef' }}
          >
            <span className="svg-icon svg-icon-2 svg-icon-primary me-0 me-md-2">
              <i className="fa-solid fa-square-poll-vertical"></i>
            </span>
            <span className="d-none d-md-inline">Resultados</span>
          </a>
        </div>
        <div className="d-flex ms-3">
          <a 
            href={`/valora/${uid}/analisis`}
            className={`btn btn-flex flex-center bg-body btn-color-gray-700 btn-active-color-primary w-40px w-md-auto h-40px px-0 px-md-6 ${selected === 'analysis' ? 'active' : ''}`}
            style={{ background: 'transparent', border: '1px solid #e4e6ef' }}
          >
            <span className="svg-icon svg-icon-2 svg-icon-primary me-0 me-md-2">
              <i className="fa-solid fa-chart-line"></i>
            </span>
            <span className="d-none d-md-inline">Análisis</span>
          </a>
        </div>
        <div className="d-flex ms-3">
          <a 
            href={`/valora/${uid}/metodologia`} 
            className={`btn btn-flex flex-center bg-body btn-color-gray-700 btn-active-color-primary w-40px w-md-auto h-40px px-0 px-md-6 ${selected === 'methodology' ? 'active' : ''}`}
          >
            <span className="svg-icon svg-icon-2 svg-icon-primary me-0 me-md-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.3" d="M19 22H5C4.4 22 4 21.6 4 21V3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22ZM12.5 18C12.5 17.4 12.6 17.5 12 17.5H8.5C7.9 17.5 8 17.4 8 18C8 18.6 7.9 18.5 8.5 18.5L12 18C12.6 18 12.5 18.6 12.5 18ZM16.5 13C16.5 12.4 16.6 12.5 16 12.5H8.5C7.9 12.5 8 12.4 8 13C8 13.6 7.9 13.5 8.5 13.5H15.5C16.1 13.5 16.5 13.6 16.5 13ZM12.5 8C12.5 7.4 12.6 7.5 12 7.5H8C7.4 7.5 7.5 7.4 7.5 8C7.5 8.6 7.4 8.5 8 8.5H12C12.6 8.5 12.5 8.6 12.5 8Z" fill="currentColor" />
                <rect x="7" y="17" width="6" height="2" rx="1" fill="currentColor" />
                <rect x="7" y="12" width="10" height="2" rx="1" fill="currentColor" />
                <rect x="7" y="7" width="6" height="2" rx="1" fill="currentColor" />
                <path d="M15 8H20L14 2V7C14 7.6 14.4 8 15 8Z" fill="currentColor" />
              </svg>
            </span>
            <span className="d-none d-md-inline">Metodología</span>
          </a>
        </div>
        <div className="d-flex ms-3">
          <a 
            href="#" 
            id="kt_activities_toggle" 
            className="btn btn-flex flex-center bg-body btn-color-primary w-40px w-md-auto h-40px px-0 px-md-6 active-report"
          >
            <span className="svg-icon svg-icon-2 svg-icon-primary me-0 me-md-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.3" d="M19 22H5C4.4 22 4 21.6 4 21V3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22ZM12.5 18C12.5 17.4 12.6 17.5 12 17.5H8.5C7.9 17.5 8 17.4 8 18C8 18.6 7.9 18.5 8.5 18.5L12 18C12.6 18 12.5 18.6 12.5 18ZM16.5 13C16.5 12.4 16.6 12.5 16 12.5H8.5C7.9 12.5 8 12.4 8 13C8 13.6 7.9 13.5 8.5 13.5H15.5C16.1 13.5 16.5 13.6 16.5 13ZM12.5 8C12.5 7.4 12.6 7.5 12 7.5H8C7.4 7.5 7.5 7.4 7.5 8C7.5 8.6 7.4 8.5 8 8.5H12C12.6 8.5 12.5 8.6 12.5 8Z" fill="currentColor" />
                <rect x="7" y="17" width="6" height="2" rx="1" fill="currentColor" />
                <rect x="7" y="12" width="10" height="2" rx="1" fill="currentColor" />
                <rect x="7" y="7" width="6" height="2" rx="1" fill="currentColor" />
                <path d="M15 8H20L14 2V7C14 7.6 14.4 8 15 8Z" fill="currentColor" />
              </svg>
            </span>
            <span className="d-none d-md-inline">Generar Reportes</span>
          </a>
        </div>
      </>
    )}
  </div>
);

const ValoraMethodology: React.FC<{ uid?: string }> = ({ uid = 'demo' }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [email, setEmail] = useState('');

  // Mock data - replace with API call
  const [categories, setCategories] = useState<Category[]>([
    {
      name: 'Introducción a la Valoración',
      products: [
        { name: 'Fundamentos de Valoración de Empresas', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' },
        { name: 'Métodos de Valoración', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' },
        { name: 'Flujo de Caja Descontado', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' }
      ]
    },
    {
      name: 'Costo de Capital',
      products: [
        { name: 'WACC - Costo Promedio Ponderado de Capital', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' },
        { name: 'Costo de Deuda', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' },
        { name: 'Costo de Patrimonio', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' }
      ]
    },
    {
      name: 'Estados Financieros',
      products: [
        { name: 'Balance General', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' },
        { name: 'Estado de Resultados', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' },
        { name: 'Flujo de Efectivo', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' }
      ]
    },
    {
      name: 'Proyecciones Financieras',
      products: [
        { name: 'Proyección de Ingresos', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' },
        { name: 'Proyección de Costos y Gastos', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' },
        { name: 'Análisis de Sensibilidad', file: 'https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview' }
      ]
    }
  ]);

  useEffect(() => {
    // Load first file by default
    if (categories.length > 0 && categories[0].products.length > 0) {
      setSelectedFile(categories[0].products[0].file);
      setSelectedFileName(categories[0].products[0].name);
    }
  }, []);

  const handleFileSelect = (file: string, name: string) => {
    setSelectedFile(file);
    setSelectedFileName(name);
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

      {/* ASIDE - Sidebar (minimized version for methodology) */}
      <div className={`aside minimized ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
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
                    <a href="/usuario/proyectos" className="menu-link fs-7">Mis proyectos</a>
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
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content aside-minimized">
        {/* Navbar */}
        <div className="results-navbar bg-white shadow-sm mb-3 py-2 px-3">
          <div className="container-xxl">
            <Navbar uid={uid} selected="methodology" />
          </div>
        </div>

        <div className="container-xxl">
          {/* Title Section */}
          <div className="bs-container-title mb-3">
            <h1 className="fs-4 mb-1">Metodología Valora</h1>
            <span className="fs-6 text-muted">Aprende con nosotros paso a paso</span>
          </div>

          {/* Content */}
          <div className="row">
            {/* Video/Document Viewer */}
            <div className="col-lg-9 mb-3">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h3 className="card-title fs-6">{selectedFileName || 'Selecciona un tema para comenzar'}</h3>
                </div>
                <div className="card-body p-0">
                  {selectedFile ? (
                    <div id="containerviewer" style={{ width: '100%', minHeight: '520px' }}>
                      <iframe 
                        width="100%" 
                        height="520" 
                        src={selectedFile}
                        title="Viewer de contenido"
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="fa-solid fa-file-pdf text-muted" style={{ fontSize: '4rem' }} />
                      <p className="text-muted mt-3">Selecciona un documento de la lista para visualizarlo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar with Categories */}
            <div className="col-lg-3 mb-3">
              <div className="card shadow-sm">
                <div className="card-header bg-primary">
                  <h3 className="card-title text-white fs-6">Aprende más sobre valoración</h3>
                </div>
                <div className="card-body p-0">
                  {categories.length > 0 ? (
                    <div className="accordion" id="accordionMethodology">
                      {categories.map((category, index) => (
                        <div className="accordion-item" key={index}>
                          <h2 className="accordion-header" id={`heading-${index}`}>
                            <button 
                              className={`accordion-button ${index === 0 ? '' : 'collapsed'}`}
                              type="button" 
                              data-bs-toggle="collapse" 
                              data-bs-target={`#collapse-${index}`}
                              aria-expanded={index === 0 ? 'true' : 'false'}
                              aria-controls={`collapse-${index}`}
                            >
                              {category.name}
                            </button>
                          </h2>
                          <div 
                            id={`collapse-${index}`}
                            className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                            aria-labelledby={`heading-${index}`}
                            data-bs-parent="#accordionMethodology"
                          >
                            <div className="accordion-body py-3">
                              {category.products.map((product, productIndex) => (
                                <div 
                                  key={productIndex}
                                  className="my-3 cursor-pointer btnviewfile"
                                  onClick={() => handleFileSelect(product.file, product.name)}
                                  style={{ 
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '0.25rem',
                                    transition: 'background-color 0.2s',
                                    backgroundColor: selectedFile === product.file ? '#f5f8fa' : 'transparent'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f8fa'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedFile === product.file ? '#f5f8fa' : 'transparent'}
                                >
                                  <i className="fa-solid fa-file-pdf me-2 text-danger"></i>
                                  {product.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-muted">No hay datos para mostrar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default ValoraMethodology;