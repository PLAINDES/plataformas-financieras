// src/components/editable/EditableLink.tsx

import { useState, useRef, useEffect } from 'react';
import type { LinkData } from '../../types/editable.types';
import { useAuthContext } from '../../hooks/useAuthContext';

interface EditableLinkProps {
  link: LinkData;
  onSave: (link: LinkData) => Promise<void>;
  className?: string;
  variant?: 'button' | 'text' | 'card';
  children?: React.ReactNode;
}

export function EditableLink({
  link,
  onSave,
  className = '',
  variant = 'text',
  children,
}: EditableLinkProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [linkData, setLinkData] = useState<LinkData>(link);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
const { isAdmin } = useAuthContext();
  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing]);

  const handleSave = async () => {
    if (linkData.url === link.url && linkData.text === link.text && linkData.target === link.target) {
      setIsEditing(false);
      return;
    }

    // Validar URL
    if (!linkData.url) {
      alert('La URL es requerida');
      return;
    }

    try {
      new URL(linkData.url.startsWith('http') ? linkData.url : `https://${linkData.url}`);
    } catch {
      alert('Por favor ingresa una URL válida');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(linkData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar. Intenta nuevamente.');
      setLinkData(link);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLinkData(link);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Renderizar según variant
  const renderLink = () => {
    const commonProps = {
      href: link.url,
      target: link.target || '_self',
      rel: link.target === '_blank' ? 'noopener noreferrer' : undefined,
      className,
    };

    if (children) {
      return <a {...commonProps}>{children}</a>;
    }

    return <a {...commonProps}>{link.text}</a>;
  };

  if (!isAdmin) {
    return renderLink();
  }

  if (isEditing) {
    return (
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          display: 'inline-block',
          minWidth: '250px',
        }}
      >
        {/* Panel de edición compacto */}
        <div
          style={{
            backgroundColor: 'white',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
            zIndex: 1000,
          }}
        >
          {/* Texto del enlace */}
          <div style={{ marginBottom: '10px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#374151',
              }}
            >
              Texto
            </label>
            <input
              type="text"
              value={linkData.text}
              onChange={(e) => setLinkData({ ...linkData, text: e.target.value })}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              placeholder="Texto del enlace"
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                outline: 'none',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
            />
          </div>

          {/* URL */}
          <div style={{ marginBottom: '10px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#374151',
              }}
            >
              URL
            </label>
            <input
              type="url"
              value={linkData.url}
              onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              placeholder="https://ejemplo.com"
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                outline: 'none',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
            />
          </div>

          {/* Target */}
          <div style={{ marginBottom: '12px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={linkData.target === '_blank'}
                onChange={(e) =>
                  setLinkData({ ...linkData, target: e.target.checked ? '_blank' : '_self' })
                }
                disabled={isSaving}
                style={{ marginRight: '6px' }}
              />
              Abrir en nueva pestaña
            </label>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              style={{
                padding: '4px 10px',
                border: '1px solid #d1d5db',
                background: 'white',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                color: '#6b7280',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: '4px 12px',
                border: 'none',
                background: isSaving ? '#9ca3af' : '#3b82f6',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontWeight: '500',
              }}
            >
              {isSaving ? '...' : 'Guardar'}
            </button>
          </div>

          {/* Ayuda */}
          <div style={{ fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center', marginTop: '6px' }}>
            Ctrl+Enter = Guardar • Esc = Cancelar
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onClick={(e) => {
        if (isAdmin) {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
      onMouseEnter={(e) => {
        if (isAdmin) {
          e.currentTarget.style.outline = '2px dashed #3b82f6';
        }
      }}
      onMouseLeave={(e) => {
        if (isAdmin) {
          e.currentTarget.style.outline = '2px dashed transparent';
        }
      }}
      title={isAdmin ? 'Click para editar enlace' : undefined}
    >
      {renderLink()}
    </div>
  );
}