import React from 'react';

interface TeamMember {
  id: string;
  name: string;
  caption: string;
  description?: string;
  image?: string;
}

interface SectionTitle {
  name: string;
  caption: string;
}

interface TeamSectionProps {
  title?: SectionTitle;
  authors?: TeamMember[];
  developmentTeam?: TeamMember[];
  collaborators?: TeamMember[];
}

export default function TeamSection({
  title = {
    name: 'Capacitación',
    caption: 'Metodología altamente confiable, gracias a la experciencia y reputación del equipo.'
  },
  authors = [
    { id: '1', name: 'PhD. Sergio Bravo Orellana', caption: 'Director de proyecto.' },
  ],
  developmentTeam = [
    { id: '1', name: 'Alvina Calluque', caption: '' },
    { id: '2', name: 'Yajaira Tácunan Alvarado', caption: '' },
    { id: '3', name: 'Max Huaccho Zavala', caption: '' },
    { id: '4', name: 'Albert Camacho', caption: '' }
  ],
  collaborators = [
    {
      id: '1',
      name: 'PROIDEAS',
      caption: 'Reportes.',
      description: 'Área de Consultoría',
      image: 'images/logo.png'
    }
  ]
}: TeamSectionProps) {
  
  const [openSection, setOpenSection] = React.useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };
  
  const gradientBg = { background: '#009ef7' };
  const sectionBg = { background: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef)' };

  return (
    <section className="py-4 py-md-5 overflow-hidden position-relative" id="equipo" style={sectionBg}>
      
      <div className="container position-relative z-index-1 px-3 px-md-4">
        
        {/* Header */}
        <div className="text-start mb-4 mb-md-5">
          <h2 className="fs-5 fs-md-4 fw-semibold text-dark mb-2 mb-md-3">
            {title.name}
          </h2>
          <p className="fs-6 fs-md-5 text-muted fw-bold mb-0">
            {title.caption}
          </p>
        </div>

        {/* Versión Desktop - Grid Principal */}
        <div className="row g-4 g-md-5 d-none d-lg-flex">
          
          {/* COLUMNA IZQUIERDA: Autores + Equipo Desarrollo */}
          <div className="col-lg-6">
            
            {/* 1. Sección Autores */}
            <div className="mb-5">
              <div className="d-flex align-items-center mb-4">
                <h3 className="h3 fw-bold m-0">Autores</h3>
              </div>
              
              <div className="d-flex flex-column gap-3 ">
                {authors.map((author) => (
                  <div key={author.id} className="card border-0 shadow-sm rounded-3 border-start border-3 border-primary ps-3">
                    <div className=" p-4">
                      <div className="d-flex align-items-center">

                        <div className="ms-3 ">
                          <h5 className="h6 fw-bold text-dark mb-1">{author.name}</h5>
                          <p className="small text-muted mb-0">{author.caption}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Sección Equipo de Desarrollo */}
            <div>
              <div className="d-flex align-items-center mb-4">
                <h3 className="h3 fw-bold m-0">Equipo de Desarrollo</h3>
              </div>

              <div className="card border-0 shadow-sm rounded-3 bg-white">
                <div className=" p-2 border-start border-3 border-primary ps-3">
                  <div className="list-group list-group-flush ">
                    {developmentTeam.map((member, index) => (
                      <div 
                        key={member.id} 
                        className="list-group-item border-0 px-2 py-2 d-flex align-items-center hover-bg-light "
                      >


                   
                        <div className="ms-3 flex-grow-1">
                           <div className="d-flex flex-wrap justify-content-between align-items-center">
                              <h6 className="mb-0 text-dark fw-bold" style={{ fontSize: '0.95rem' }}>
                                {member.name}
                              </h6>
                              {member.caption && (
                                <small className="text-muted ms-auto">{member.caption}</small>
                              )}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: Colaboradores */}
          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-4">
              <h3 className="h3 fw-bold m-0">Colaboradores</h3>
            </div>

            <div className="d-flex flex-column ">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="card border-0 shadow rounded-3 h-100 border-start border-3 border-primary ">
                  <div className=" p-4  text-start">
                    
                    {collaborator.image && (
                      <div className="mb-4 d-flex justify-content-start">
                        <div className="p-3 border rounded-3 bg-white shadow-sm" style={{ maxWidth: '150px' }}>
                          <img
                            src={collaborator.image}
                            alt={collaborator.name}
                            className="img-fluid"
                            style={{ maxHeight: '80px', objectFit: 'contain' }}
                            onError={(e) => {
                              e.currentTarget.src = 'https://media.istockphoto.com/id/1311598658/photo/businessman-trading-online-stock-market-on-teblet-screen-digital-investment-concept.jpg?s=1024x1024&w=is&k=20&c=JZprgGDQ8xqa6iu0fyKJfKOlAvae0w9U-AdHeCT2kg4=';
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <h5 className="h6 fw-bold text-dark mb-2">{collaborator.name}</h5>
                    <p className="display-10 text-secondary mb-3">{collaborator.caption}</p>

                    {collaborator.description && (
                      <div className=" rounded-3 px-2 py-1 bg-light ">
                        <small className="fw-semibold">{collaborator.description}</small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Versión Mobile - Acordeón */}
        <div className="d-lg-none">
          
          {/* Acordeón Autores */}
          <div className="mb-3">
            <button
              className="btn btn-link w-100 text-start text-decoration-none p-0 border-0"
              onClick={() => toggleSection('authors')}
            >
              <div className="card border-0 shadow-sm rounded-3 w-100">
                <div className=" p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <h3 className="h5 fw-bold m-0 text-dark">Autores</h3>
                    </div>
                    <svg 
                      width="20" 
                      height="20" 
                      fill="currentColor" 
                      className="text-muted"
                      style={{ 
                        transform: openSection === 'authors' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <path d="M5 8l5 5 5-5z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </button>
            
            {openSection === 'authors' && (
              <div className="mt-3 animate-fade-in ">
                <div className="d-flex flex-column gap-3">
                  {authors.map((author) => (
                    <div key={author.id} className="card border-0 shadow-sm rounded-3 border-start border-3 border-primary ps-3">
                      <div className=" p-3">
                        <div className="d-flex align-items-center">
                        
                          <div className="ms-3">
                            <h5 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{author.name}</h5>
                            <p className="small text-muted mb-0">{author.caption}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Acordeón Equipo de Desarrollo */}
          <div className="mb-3">
            <button
              className="btn btn-link w-100 text-start text-decoration-none p-0 border-0"
              onClick={() => toggleSection('development')}
            >
              <div className="card border-0 shadow-sm rounded-3 w-100">
                <div className=" p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <h3 className="h5 fw-bold m-0 text-dark">Equipo de Desarrollo</h3>
                    </div>
                    <svg 
                      width="20" 
                      height="20" 
                      fill="currentColor" 
                      className="text-muted"
                      style={{ 
                        transform: openSection === 'development' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <path d="M5 8l5 5 5-5z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </button>
            
            {openSection === 'development' && (
              <div className="mt-3 animate-fade-in">
                <div className="card border-0 shadow-sm rounded-3 bg-white">
                  <div className=" p-2">
                    <div className="list-group list-group-flush">
                      {developmentTeam.map((member, index) => (
                        <div 
                          key={member.id} 
                          className="list-group-item border-0 px-2 py-2 d-flex align-items-center border-start border-3 border-primary ps-3"
                        >
                         
                          <div className="ms-3 flex-grow-1">
                            <div className="d-flex flex-column">
                              <h6 className="mb-0 text-dark fw-bold" style={{ fontSize: '0.9rem' }}>
                                {member.name}
                              </h6>
                              {member.caption && (
                                <small className="text-muted">{member.caption}</small>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Acordeón Colaboradores */}
          <div className="mb-3">
            <button
              className="btn btn-link w-100 text-start text-decoration-none p-0 border-0"
              onClick={() => toggleSection('collaborators')}
            >
              <div className="card border-0 shadow-sm rounded-3 w-100">
                <div className=" p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <h3 className="h5 fw-bold m-0 text-dark">Colaboradores</h3>
                    </div>
                    <svg 
                      width="20" 
                      height="20" 
                      fill="currentColor" 
                      className="text-muted"
                      style={{ 
                        transform: openSection === 'collaborators' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <path d="M5 8l5 5 5-5z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </button>
            
            {openSection === 'collaborators' && (
              <div className="mt-3 animate-fade-in ">
                <div className="d-flex flex-column gap-3 ">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="card border-0 shadow rounded-3 border-start border-3 border-primary ps-3">
                      <div className=" p-4 text-start ">
                        {collaborator.image && (
                          <div className="mb-3 d-flex justify-content-start">
                            <div className="p-3 border rounded-3 bg-white shadow-sm" style={{ maxWidth: '150px' }}>
                              <img
                                src={collaborator.image}
                                alt={collaborator.name}
                                className="img-fluid"
                                style={{ maxHeight: '60px', objectFit: 'contain' }}
                                onError={(e) => {
                                  e.currentTarget.src = 'https://media.istockphoto.com/id/1311598658/photo/businessman-trading-online-stock-market-on-teblet-screen-digital-investment-concept.jpg?s=1024x1024&w=is&k=20&c=JZprgGDQ8xqa6iu0fyKJfKOlAvae0w9U-AdHeCT2kg4=';
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <h5 className="h6 fw-bold text-dark mb-2">{collaborator.name}</h5>
                        <p className="small text-muted mb-3">{collaborator.caption}</p>
                        {collaborator.description && (
                          <div className=" rounded-3 px-2 py-1 bg-light ">
                            <small className="fw-semibold">{collaborator.description}</small>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Estilos adicionales */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }
        
        @media (max-width: 991.98px) {
          .h5 {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </section>
  );
}