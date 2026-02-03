// src/components/editable/EditableText.tsx

import { useState, useRef, useEffect } from 'react';
import type { EditableContent } from '../../types/editable.types';
import { useAuthContext } from '../../hooks/useAuthContext';

interface EditableTextProps {
  content: EditableContent;
  onSave: (content: EditableContent) => Promise<void>;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export function EditableText({
  content,
  onSave,
  className = '',
  as: Component = 'p',
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content.value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useAuthContext();


  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

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
    const hasContentChanged = value !== content.value;

    if (!hasContentChanged) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...content,
        value,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar. Intenta nuevamente.');
      setValue(content.value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(content.value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };



  if (!isAdmin) {
    return (
      <Component className={className}>
        {content.value}
      </Component>
    );
  }

  if (isEditing) {
    return (
      <div 
        ref={containerRef}
        style={{ 
          position: 'relative',
          display: 'inline-block',
          minWidth: '200px',
          width: '100%',
        }}
      >
        {/* Textarea de edición */}
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          style={{
            width: '100%',
            minHeight: '40px',
            padding: '8px 10px',
            border: '2px solid #3b82f6',
            borderRadius: '6px',
            fontSize: 'inherit',
            fontFamily: 'inherit',
            lineHeight: 'inherit',
            resize: 'vertical',
            outline: 'none',
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
          }}
          rows={1}
        />

        {/* Panel compacto debajo */}
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Botones principales */}
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
          <div style={{ fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center' }}>
            Ctrl+Enter = Guardar • Esc = Cancelar
          </div>
        </div>
      </div>
    );
  }

  return (
    <Component
      className={`${className} editable-text`}
      onClick={() => setIsEditing(true)}
      style={{
        cursor: 'pointer',
        outline: '2px dashed transparent',
        transition: 'outline 0.2s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.outline = '2px dashed #3b82f6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.outline = '2px dashed transparent';
      }}
      title="Click para editar"
    >
      {content.value}
    </Component>
  );
}