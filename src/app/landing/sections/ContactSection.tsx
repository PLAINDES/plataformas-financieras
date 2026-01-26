import React from 'react';

export function ContactSection() {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('¡Mensaje enviado! Nos pondremos en contacto contigo pronto.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contacto" className="py-5 py-lg-10 bg-light position-relative overflow-hidden">
      <div className="container-fluid px-0">
        <div className="row g-0">
          
          {/* Versión Desktop/Tablet */}
          <div className="d-none d-lg-flex w-100">
            <div className="col-lg-6 d-flex align-items-center justify-content-center p-5 p-xl-8">
              <div className="w-100" style={{ maxWidth: '600px' }}>
                <div className="mb-5">
                  <h2 className="h3 fw-bold text-dark mb-2">Contacta con nosotros</h2>
                  <p className="text-muted mb-0">¡Estamos aquí para ayudarte!</p>
                </div>

                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Nombre y Apellido</label>
                      <input 
                        type="text" 
                        name="name"
                        className="form-control" 
                        placeholder="Aquí va tu nombre"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Email</label>
                      <input 
                        type="email" 
                        name="email"
                        className="form-control" 
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Mensaje</label>
                      <textarea 
                        name="message"
                        className="form-control" 
                        rows={4} 
                        placeholder="Escribe tu mensaje aquí..."
                        value={formData.message}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <button 
                      type="button" 
                      className="btn btn-primary w-100"
                      onClick={handleSubmit}
                    >
                      Enviar Mensaje
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white p-5">
              <div className="text-center">
                <img 
                  src="images/web-contact.png" 
                  alt="Contacto" 
                  className="img-fluid"
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&auto=format&fit=crop';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Versión Mobile - Card con Flip */}
          <div className="d-lg-none w-100 px-3 py-4">
            <div className="flip-card" style={{ perspective: '1000px', minHeight: '600px' }}>
              <div 
                className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  minHeight: '600px',
                  transition: 'transform 0.6s',
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Cara Frontal - Imagen */}
                <div 
                  className="flip-card-front card border-0 shadow-lg rounded-4"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <div className="card-body p-0 d-flex flex-column justify-content-between" style={{ height: '100%' }}>
                    <div className="p-4 text-center flex-grow-1 d-flex flex-column justify-content-center bg-gradient" style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                      <div className="mb-4">
                        <div className="mb-3">
                          <svg width="64" height="64" fill="white" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </div>
                        <h2 className="h4 fw-bold text-white mb-2">¿Necesitas ayuda?</h2>
                        <p className="text-white-50 mb-0 small">Estamos aquí para responder tus preguntas</p>
                      </div>
                      
                      <img 
                        src="images/web-contact.png" 
                        alt="Contacto" 
                        className="img-fluid rounded-3 mb-3"
                        style={{ maxHeight: '250px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=600&auto=format&fit=crop';
                        }}
                      />
                    </div>

                    <div className="p-4 bg-white">
                      <button 
                        onClick={handleFlip}
                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                      >
                        <span>Enviar mensaje</span>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cara Trasera - Formulario */}
                <div 
                  className="flip-card-back card border-0 shadow-lg rounded-4"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="card-body p-4 d-flex flex-column" style={{ height: '100%' }}>
                    <div className="mb-4 d-flex align-items-center justify-content-between">
                      <div>
                        <h3 className="h5 fw-bold text-dark mb-1">Contáctanos</h3>
                        <p className="text-muted mb-0 small">Completa el formulario</p>
                      </div>
                      <button 
                        onClick={handleFlip}
                        className="btn btn-sm btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center"
                        style={{ width: '36px', height: '36px' }}
                      >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                      </button>
                    </div>

                    <div className="flex-grow-1 d-flex flex-column">
                      <div className="mb-3">
                        <label className="form-label fw-semibold small">Nombre y Apellido</label>
                        <input 
                          type="text" 
                          name="name"
                          className="form-control form-control-sm" 
                          placeholder="Aquí va tu nombre"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold small">Email</label>
                        <input 
                          type="email" 
                          name="email"
                          className="form-control form-control-sm" 
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="mb-3 flex-grow-1">
                        <label className="form-label fw-semibold small">Mensaje</label>
                        <textarea 
                          name="message"
                          className="form-control form-control-sm" 
                          rows={5}
                          placeholder="Escribe tu mensaje aquí..."
                          value={formData.message}
                          onChange={handleChange}
                        ></textarea>
                      </div>

                      <button 
                        type="button" 
                        className="btn btn-primary w-100 mt-auto"
                        onClick={handleSubmit}
                      >
                        Enviar Mensaje
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicador de acción */}
            <div className="text-center mt-3">
              <small className="text-muted">
                {isFlipped ? '← Volver a la información' : 'Toca "Enviar mensaje" para contactarnos →'}
              </small>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }

        @media (max-width: 991.98px) {
          .form-control-sm {
            font-size: 0.875rem;
            padding: 0.5rem 0.75rem;
          }
          
          .form-label {
            margin-bottom: 0.25rem;
          }
        }

        .btn {
          transition: all 0.3s ease;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .flip-card {
          margin: 0 auto;
          max-width: 500px;
        }
      `}</style>
    </section>
  );
}