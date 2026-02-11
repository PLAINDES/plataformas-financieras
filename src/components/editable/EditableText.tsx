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
      <div 
        ref={containerRef}
        className="relative inline-block min-w-[200px] w-full"
      >
        {/* Textarea de edición */}
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          rows={1}
          className="w-full min-h-[40px] p-2 border-2 border-blue-500 rounded-md shadow-lg outline-none resize-y bg-white text-inherit font-inherit leading-inherit"
        />

        {/* Panel compacto debajo */}
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-md p-2 shadow-xl z-50 flex flex-col gap-2">
          {/* Botones */}
          <div className="flex justify-end gap-1.5">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-2.5 py-1 border border-gray-300 bg-white rounded text-[10px] text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 bg-blue-600 text-white rounded text-[10px] font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isSaving ? '...' : 'Guardar'}
            </button>
          </div>

          {/* Atajos */}
          <div className="text-[9px] text-gray-400 text-center uppercase tracking-wider">
            Ctrl+Enter = Guardar • Esc = Cancelar
          </div>
        </div>
      </div>
    );
  }

  return (
    <Component
      className={`
        ${className} 
        relative cursor-pointer transition-all duration-200
        outline-2 outline-dashed outline-transparent hover:outline-blue-500
        hover:bg-blue-50/30 rounded
      `}
      onClick={() => setIsEditing(true)}
      title="Click para editar"
    >
      {content.value}
    </Component>
  );
}