// src/app/landing/sections/CTASection.tsx

import { useState } from 'react';
import { EditableText } from '../../../components/editable/EditableText';
import type { EditableContent } from '../../../types/editable.types';
import { useAuthContext } from '../../../hooks/useAuthContext';

interface CTASectionProps {
  content?: {
    text?: string;
    whatsappNumber?: string;
  };
  isAdmin?: boolean;
  onSave?: (content: EditableContent) => Promise<void>;
}

export function CTASection({
  content = {},
  isAdmin = false,
  onSave,
}: CTASectionProps) {
  const { isAdmin: isAdminContext } = useAuthContext();
  const isAdminMode = isAdmin || isAdminContext;
  
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [editedNumber, setEditedNumber] = useState(content.whatsappNumber || '51999999999');

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      'Hola! Me gustaría unirme a la plataforma de finanzas'
    );
    window.open(
      `https://wa.me/${content.whatsappNumber || '51999999999'}?text=${message}`,
      '_blank'
    );
  };

  const handleSaveNumber = async () => {
    // Validar que solo contenga números
    if (!/^\d+$/.test(editedNumber)) {
      alert('El número solo debe contener dígitos');
      return;
    }

    if (editedNumber.length < 10) {
      alert('El número debe tener al menos 10 dígitos');
      return;
    }

    if (onSave) {
      await onSave({
        id: 'cta_whatsappNumber',
        type: 'text',
        value: editedNumber,
        section: 'cta',
      });
    }

    setIsEditingNumber(false);
  };

  const handleCancelNumber = () => {
    setEditedNumber(content.whatsappNumber || '51999999999');
    setIsEditingNumber(false);
  };

  return (
    <div className="bs-landing-section">
      <div className="d-flex flex-column flex-center w-100">
        <div className="text-center mb-3 bs-content-1">
          <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 px-3 px-md-4">

            {/* Botón de WhatsApp - Siempre visible */}
            <button
              type="button"
              onClick={isAdminMode ? undefined : handleWhatsAppClick}
              className="btn btn-lg btn-primary d-flex align-items-center justify-content-center gap-2"
              style={{
                minHeight: '48px',
                padding: '12px 18px',
                fontSize: '14px',
                width: '100%',
                maxWidth: '280px',
                cursor: isAdminMode ? 'default' : 'pointer',
                position: 'relative',
              }}
              disabled={isAdminMode}
            >
              {/* WhatsApp Icon SVG */}
              <svg 
                viewBox="0 0 256 259" 
                width="20" 
                height="20" 
                xmlns="http://www.w3.org/2000/svg" 
                preserveAspectRatio="xMidYMid"
                style={{ flexShrink: 0 }}
              >
                <path 
                  d="m67.663 221.823 4.185 2.093c17.44 10.463 36.971 15.346 56.503 15.346 61.385 0 111.609-50.224 111.609-111.609 0-29.297-11.859-57.897-32.785-78.824-20.927-20.927-48.83-32.785-78.824-32.785-61.385 0-111.61 50.224-110.912 112.307 0 20.926 6.278 41.156 16.741 58.594l2.79 4.186-11.16 41.156 41.853-10.464Z" 
                  fill="#00E676"
                />
                <path 
                  d="M219.033 37.668C195.316 13.254 162.531 0 129.048 0 57.898 0 .698 57.897 1.395 128.35c0 22.322 6.278 43.947 16.742 63.478L0 258.096l67.663-17.439c18.834 10.464 39.76 15.347 60.688 15.347 70.453 0 127.653-57.898 127.653-128.35 0-34.181-13.254-66.269-36.97-89.986ZM129.048 234.38c-18.834 0-37.668-4.882-53.712-14.648l-4.185-2.093-40.458 10.463 10.463-39.76-2.79-4.186C7.673 134.63 22.322 69.058 72.546 38.365c50.224-30.692 115.097-16.043 145.79 34.181 30.692 50.224 16.043 115.097-34.18 145.79-16.045 10.463-35.576 16.043-55.108 16.043Zm61.385-77.428-7.673-3.488s-11.16-4.883-18.136-8.371c-.698 0-1.395-.698-2.093-.698-2.093 0-3.488.698-4.883 1.396 0 0-.697.697-10.463 11.858-.698 1.395-2.093 2.093-3.488 2.093h-.698c-.697 0-2.092-.698-2.79-1.395l-3.488-1.395c-7.673-3.488-14.648-7.674-20.229-13.254-1.395-1.395-3.488-2.79-4.883-4.185-4.883-4.883-9.766-10.464-13.253-16.742l-.698-1.395c-.697-.698-.697-1.395-1.395-2.79 0-1.395 0-2.79.698-3.488 0 0 2.79-3.488 4.882-5.58 1.396-1.396 2.093-3.488 3.488-4.883 1.395-2.093 2.093-4.883 1.395-6.976-.697-3.488-9.068-22.322-11.16-26.507-1.396-2.093-2.79-2.79-4.883-3.488H83.01c-1.396 0-2.79.698-4.186.698l-.698.697c-1.395.698-2.79 2.093-4.185 2.79-1.395 1.396-2.093 2.79-3.488 4.186-4.883 6.278-7.673 13.951-7.673 21.624 0 5.58 1.395 11.161 3.488 16.044l.698 2.093c6.278 13.253 14.648 25.112 25.81 35.575l2.79 2.79c2.092 2.093 4.185 3.488 5.58 5.58 14.649 12.557 31.39 21.625 50.224 26.508 2.093.697 4.883.697 6.976 1.395h6.975c3.488 0 7.673-1.395 10.464-2.79 2.092-1.395 3.487-1.395 4.882-2.79l1.396-1.396c1.395-1.395 2.79-2.092 4.185-3.487 1.395-1.395 2.79-2.79 3.488-4.186 1.395-2.79 2.092-6.278 2.79-9.765v-4.883s-.698-.698-2.093-1.395Z" 
                  fill="#FFF"
                />
              </svg>
              
              {/* Texto editable */}
              <span className="text-truncate">
                <EditableText
                  content={{ 
                    value: content.text || 'Únete a la comunidad', 
                    id: 'cta_text', 
                    type: 'text', 
                    section: 'cta' 
                  }}
                  onSave={onSave || (async () => {})}
                  as="span"
                  className="fw-semibold"
                />
              </span>
            </button>

            {/* Editor de número de WhatsApp - Solo en modo admin */}
            {isAdminMode && (
              <div className="mt-2 mt-md-0">
                {!isEditingNumber ? (
                  <div 
                    className="d-flex align-items-center gap-2 p-2 rounded"
                    style={{
                      border: '2px dashed #3b82f6',
                      cursor: 'pointer',
                      background: 'rgba(59, 130, 246, 0.05)',
                    }}
                    onClick={() => setIsEditingNumber(true)}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    <small className="text-muted">
                      WhatsApp: +{content.whatsappNumber || '51999999999'}
                    </small>
                  </div>
                ) : (
                  <div 
                    className="p-3 rounded shadow-sm"
                    style={{
                      border: '2px solid #3b82f6',
                      background: 'white',
                      minWidth: '250px',
                    }}
                  >
                    <label className="form-label small fw-bold mb-2">
                      Número de WhatsApp
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm mb-2"
                      value={editedNumber}
                      onChange={(e) => setEditedNumber(e.target.value)}
                      placeholder="51999999999"
                      pattern="\d*"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveNumber();
                        } else if (e.key === 'Escape') {
                          handleCancelNumber();
                        }
                      }}
                    />
                    <small className="text-muted d-block mb-2">
                      Código de país + número (ej: 51987654321)
                    </small>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={handleCancelNumber}
                      >
                        Cancelar
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={handleSaveNumber}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}