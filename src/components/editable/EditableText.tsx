// src/components/editable/EditableText.tsx

import { useState, useRef, useEffect } from 'react';
import type { EditableContent } from '../../types/editable.types';

interface EditableTextProps {
  content: EditableContent;
  isAdmin: boolean;
  onSave: (content: EditableContent) => Promise<void>;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export function EditableText({
  content,
  isAdmin,
  onSave,
  className = '',
  as: Component = 'p',
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content.value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleSave = async () => {
    if (value === content.value) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave({ ...content, value });
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
    return <Component className={className}>{content.value}</Component>;
  }
  
  if (isEditing) {
    return (
      <div className={`editable-text-wrapper ${className}`} style={{ position: 'relative' }}>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="form-control"
          rows={3}
          disabled={isSaving}
          style={{
            width: '100%',
            resize: 'vertical',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
          }}
        />
        <div className="d-flex gap-2 mt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-sm btn-primary"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="btn btn-sm btn-secondary"
          >
            Cancelar
          </button>
        </div>
        <small className="text-muted d-block mt-1">
          Ctrl+Enter para guardar, Esc para cancelar
        </small>
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
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.outline = '2px dashed #009ef7';
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