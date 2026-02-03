// src/app/landing/sections/ContactSection.tsx

import React, { useState } from 'react';
import { EditableText } from "../../../components/editable/EditableText";
import { EditableImage } from '../../../components/editable/EditableImage';
import { EditableForm } from '../../../components/editable/EditableForm';
import type { EditableContent } from '../../../types/editable.types';
import { useAuthContext } from '../../../hooks/useAuthContext';

interface ContactFormConfig {
  fields: FormField[];
  submitButtonText: string;
  successMessage: string;
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea';
  placeholder: string;
  required: boolean;
  rows?: number;
}

interface ContactSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    form?: ContactFormConfig;
  };
  onSave?: (data: EditableContent) => Promise<void>;
}


export function ContactSection({content, onSave}: ContactSectionProps) {
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { isAdmin } = useAuthContext();

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert(content.form?.successMessage || 'Form submitted successfully');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveContent = async (editableContent: EditableContent) => {
    await onSave({
      section: 'contact',
      field: editableContent.id,
      value: editableContent.value,
    });
  };

  const handleSaveFormConfig = async (config: ContactFormConfig) => {
    await onSave({
      section: 'contact',
      field: 'formConfig',
      value: config,
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
                  <EditableText 
                    content={{ 
                      value: content.title ?? '', 
                      id: 'title', 
                      type: 'text', 
                      section: 'contact' 
                    }}
                    onSave={onSave} 
                    as="h2" 
                    className="fs-5 fs-md-4 fw-semibold text-dark mb-2 mb-md-3" 
                  />
                  <EditableText 
                    content={{ 
                      value: content.subtitle ?? '', 
                      id: 'subtitle', 
                      type: 'text', 
                      section: 'contact' 
                    }}
                    onSave={onSave} 
                    as="p" 
                    className="text-muted mb-0" 
                  />
                </div>

                {/* Formulario Editable */}
                <EditableForm
                  config={content.form || { fields: [], submitButtonText: 'Enviar', successMessage: '¡Mensaje enviado con éxito!' }}
                  onSaveConfig={handleSaveFormConfig}
                  onSubmit={handleSubmit}
                  formData={formData}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white p-5">
              <div className="text-center">
                <EditableImage 
                  content={{ 
                    value: content.imageUrl ?? '', 
                    id: 'contact-image', 
                    type: 'image', 
                    section: 'contact' 
                  }} 
                  onSave={handleSaveContent} 
                  alt='Imagen de contacto' 
                  className='img-fluid object-fit-contain img-max-h-600' 
                />
              </div>
            </div>
          </div>

          {/* Versión Mobile - Card con Flip */}
          <div className="d-lg-none w-100 px-3 py-4">
            <div className="flip-card" style={{ perspective: '1000px', minHeight: '650px' }}>
              <div 
                className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  minHeight: '650px',
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
                  <div className="card-body p-0 d-flex flex-column" style={{ height: '100%' }}>
                    {/* Sección superior con gradiente y contenido */}
                    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4 text-center bg-gradient" style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      minHeight: '70%'
                    }}>
                      <div className="mb-4">
                        <svg width="64" height="64" fill="white" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                      </div>
                      
                      <EditableText 
                        content={{ 
                          value: "¿Necesitas ayuda?", 
                          id: 'contact-mobile-title', 
                          type: 'text', 
                          section: 'contact' 
                        }}
                        onSave={handleSaveContent} 
                        as="h2" 
                        className="h4 fw-bold  mb-2" 
                      />
                      <EditableText 
                        content={{ 
                          value: "Estamos aquí para responder tus preguntas", 
                          id: 'contact-mobile-subtitle', 
                          type: 'text', 
                          section: 'contact' 
                        }}
                        onSave={handleSaveContent} 
                        as="p" 
                        className=" mb-4 small px-3" 
                      />
                      
                      {/* Imagen que ocupa más espacio */}
                      <div className="w-100 px-3">
                        <EditableImage 
                          content={{ 
                            value: content.imageUrl ?? '', 
                            id: 'contact-mobile-image', 
                            type: 'image', 
                            section: 'contact' 
                          }} 
                          onSave={handleSaveContent} 
                          alt='Contacto' 
                          className='img-fluid rounded-3'
                          style={{ maxHeight: '300px', width: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </div>

                    {/* Botón inferior */}
                    <div className="p-4 bg-white" style={{ minHeight: '30%', display: 'flex', alignItems: 'center' }}>
                      <button 
                        onClick={handleFlip}
                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-3"
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
                  <div className="card-body p-3 d-flex flex-column" style={{ height: '100%' }}>
                    {/* Header del formulario - compacto */}
                    <div className="mb-2 d-flex align-items-center justify-content-between flex-shrink-0">
                      <div className="flex-grow-1">
                        <h3 className="h6 fw-bold text-dark mb-0">Contáctanos</h3>
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Completa el formulario</p>
                      </div>
                      <button 
                        onClick={handleFlip}
                        className="btn btn-sm btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '32px', height: '32px' }}
                      >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                      </button>
                    </div>

                    {/* Formulario Editable - Mobile Version */}
                    <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
                      <EditableForm
                        config={content.form || { fields: [], submitButtonText: 'Enviar', successMessage: '¡Mensaje enviado con éxito!' }}
                        onSaveConfig={handleSaveFormConfig}
                        onSubmit={handleSubmit}
                        formData={formData}
                        onChange={handleChange}
                        mobileMode={true}
                      />
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

        /* Mejorar responsive del flip card en mobile */
        @media (max-width: 575px) {
          .flip-card {
            min-height: 600px !important;
          }
          
          .flip-card-inner {
            min-height: 600px !important;
          }
          
          .flip-card-front .card-body,
          .flip-card-back .card-body {
            padding: 1rem !important;
          }
          
          .form-control-sm {
            font-size: 0.8rem;
            padding: 0.4rem 0.6rem;
          }
        }

        @media (min-width: 576px) and (max-width: 991.98px) {
          .flip-card {
            max-width: 600px;
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

        .img-max-h-600 {
          max-height: 600px;
        }
      `}</style>
    </section>
  );
}