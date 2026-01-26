import React, { useState, useEffect } from 'react';


export function ProductsSection({ isAdmin }: { isAdmin: boolean }) {
  const [activeTab, setActiveTab] = useState<'kapital' | 'valora'>('kapital');
  const [currentPage, setCurrentPage] = useState(0);

  // Colores personalizados (Bootstrap no trae gradientes morados por defecto)
  const customStyles = {
    gradientText: {
      background: '-webkit-linear-gradient(45deg, #181C32, #009ef7)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    gradientCard: {
      background: 'linear-gradient(135deg, rgba(179, 233, 255, 0.5) 0%, rgba(179, 233, 255, 0.5) 100%)',
    },
    navPillActive: {
      backgroundColor: '#009ef7',
    }
  };

  const productosKapital = [
    { id: 1, name: 'Kapital Pro', caption: 'Sistema integral de gestión empresarial con módulos de facturación.', price: 299, ribbon: null, typeName: 'Sistema' },
    { id: 2, name: 'Kapital POS', caption: 'Punto de venta completo para tiendas y restaurantes.', price: 199, ribbon: null, typeName: 'Sistema' },
  ];

  const productosValora = [
    { id: 5, name: 'Valora Analytics', caption: 'Análisis de datos en tiempo real con dashboard.', price: 399, ribbon: null, typeName: 'Plataforma' },
    { id: 6, name: 'Valora CRM', caption: 'Gestión de clientes y ventas con automatización.', price: 249, ribbon: null, typeName: 'Sistema' },
    { id: 7, name: 'Valora Reports', caption: 'Generación de reportes financieros automatizados.', price: 0, ribbon: null, typeName: 'Herramienta' }
  ];

  const activeProducts = activeTab === 'kapital' ? productosKapital : productosValora;

  // Lógica de Paginación Responsiva
  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 992) return 3; // Desktop
    if (window.innerWidth >= 768) return 2; // Tablet
    return 1; // Mobile
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  useEffect(() => {
    const handleResize = () => setItemsPerPage(getItemsPerPage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reiniciar página al cambiar de tab
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab]);

  const totalPages = Math.ceil(activeProducts.length / itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  const getVisibleProducts = () => {
    const start = currentPage * itemsPerPage;
    return activeProducts.slice(start, start + itemsPerPage);
  };

  const visibleProducts = getVisibleProducts();
  const isSingleCard = visibleProducts.length === 1;


  return (
    <section id="productos" className="py-5 bg-light position-relative overflow-hidden">
      <div className="container py-lg-5 position-relative z-index-1">
        
        {/* Header */}
        <div className="text-start mb-1">
          <h2 className="display-16  mb-4 text-dark">Productos</h2>
          
          {/* Tabs estilo Bootstrap Pills */}
          <ul className="nav nav-pills justify-content-start gap-3" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link fw-bold px-3 py-2 shadow-sm ${activeTab === 'kapital' ? 'active' : 'bg-white text-secondary'}`}
                onClick={() => setActiveTab('kapital')}
                style={activeTab === 'kapital' ? customStyles.navPillActive : {}}
              >
                Kapital
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold px-3 py-2 shadow-sm ${activeTab === 'valora' ? 'active' : 'bg-white text-secondary'}`}
                onClick={() => setActiveTab('valora')}
                style={activeTab === 'valora' ? customStyles.navPillActive : {}}
              >
                Valora
              </button>
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div className="position-relative px-lg-5 ">
          
          {/* Grid de Productos */}
          <div className={`row g-4  ${isSingleCard ? 'justify-content-center' : 'justify-content-start'}`}>

            {getVisibleProducts().map((product) => (
              <div key={product.id} className={isSingleCard ? ` col-10 col-md-6 col-lg-4`: `col-12 col-md-6 col-lg-4 `}>
                  
          
                  <div className={` d-flex flex-column p-4 bs-card-2 `}>
                    {/* Imagen / Icono */}
                    <div 
                      className={`${isSingleCard ? 'mx-auto bs-card-image--single' : ''} rounded-3 d-flex align-items-center justify-content-center mb-4 text-white bs-card-image `}
                      style={{ ...customStyles.gradientCard, height: isSingleCard ? '120px' : '80px', width: isSingleCard ? '150px':''}}
                    >
                      <i className="fa-solid fa-laptop fa-xs fs-3"></i>
                    </div>

                    {/* Info */}
                    <h3 className="h4 fw-bold mb-2 text-dark">{product.name}</h3>
                    <p className="text-muted flex-grow-1">{product.caption}</p>

                    {/* Footer Interno */}
                    <div className="mt-4 pt-3 border-top d-flex flex-column gap-3">
                        <button className="btn btn-outline-primary w-100  ">
                            Adquirir {product.typeName} <i className="fa-solid fa-chevron-right ms-2 small"></i>
                        </button>
                        <div className="text-center">
                            <span className="h4 fs-5 text-primary">
                            {product.price === 0 ? 'Gratis' : `S/ ${product.price}.00`}
                            </span>
                        </div>
                        
                    </div>
                  </div>
                </div>
            ))}
          </div>

          {/* Controles de Navegación (Solo si hay más de 1 página) */}
          {totalPages > 1 && (
            <>
              <button 
                className="btn btn-white rounded-circle shadow position-absolute top-50 start-0 translate-middle-y ms-1 d-none d-lg-flex align-items-center justify-content-center" 
                style={{ width: '45px', height: '45px', zIndex: 10 }}
                onClick={prevPage}
              >
                <i className="fa-solid fa-chevron-left text-primary"></i>
              </button>
              <button 
                className="btn btn-white rounded-circle shadow position-absolute top-50 end-0 translate-middle-y me-1 d-none d-lg-flex align-items-center justify-content-center"
                style={{ width: '45px', height: '45px', zIndex: 10 }}
                onClick={nextPage}
              >
                <i className="fa-solid fa-chevron-right text-primary"></i>
              </button>

              {/* Indicadores Móviles */}
              <div className="d-flex justify-content-center gap-2 mt-4 d-lg-none">
                  {[...Array(totalPages)].map((_, idx) => (
                      <button 
                        key={idx}
                        className={`btn btn-sm rounded-circle p-1 ${idx === currentPage ? 'btn-primary' : 'btn-light'}`}
                        style={{ width: '10px', height: '10px' }}
                        onClick={() => setCurrentPage(idx)}
                      />
                  ))}
              </div>
            </>
          )}

        </div>

        {/* Footer Link */}
        <div className="text-center mt-5">
          <a href="#kt_body" className="btn btn-primary px-5 py-3 fw-bold rounded-pill shadow-sm">
            Ver catálogo completo <i className="fa-solid fa-arrow-right ms-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
}