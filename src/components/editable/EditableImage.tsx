// src/components/editable/EditableImage.tsx

import { useState, useRef } from 'react';
import type { EditableContent } from '../../types/editable.types';

interface EditableImageProps {
  content: EditableContent;
  isAdmin: boolean;
  onSave: (content: EditableContent) => Promise<void>;
  className?: string;
  alt?: string;
}

export function EditableImage({
  content,
  isAdmin,
  onSave,
  className = '',
  alt = 'Image',
}: EditableImageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(content.value);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB');
      return;
    }

    setIsSaving(true);
    try {
      // Convertir a base64 para preview
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setImageUrl(base64);

        // Aquí deberías subir la imagen a tu servidor
        // Por ahora guardamos el base64
        await onSave({ ...content, value: base64 });
        setIsEditing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen. Intenta nuevamente.');
      setImageUrl(content.value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUrlChange = async () => {
    if (imageUrl === content.value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ ...content, value: imageUrl });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar. Intenta nuevamente.');
      setImageUrl(content.value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setImageUrl(content.value);
    setIsEditing(false);
  };

  if (!isAdmin) {
    return (
      <img 
        src={content.value} 
        alt={alt} 
        className={className}
      />
    );
  }

  if (isEditing) {
    return (
      <div className={`editable-image-wrapper ${className}`}>
        <img 
          src={imageUrl} 
          alt={alt} 
          className={className}
          style={{ opacity: isSaving ? 0.5 : 1 }}
        />
        
        <div className="mt-3 p-3 border rounded">
          <h6>Editar Imagen</h6>
          
          {/* Upload de archivo */}
          <div className="mb-3">
            <label className="form-label">Subir nueva imagen:</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-control"
              disabled={isSaving}
            />
            <small className="text-muted">Máx. 5MB - JPG, PNG, GIF, WebP</small>
          </div>

          {/* O URL directa */}
          <div className="mb-3">
            <label className="form-label">O ingresa URL:</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="form-control"
              placeholder="https://ejemplo.com/imagen.jpg"
              disabled={isSaving}
            />
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={handleUrlChange}
              disabled={isSaving}
              className="btn btn-sm btn-primary"
            >
              {isSaving ? 'Guardando...' : 'Guardar URL'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="btn btn-sm btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="editable-image-container"
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <img 
        src={content.value} 
        alt={alt} 
        className={className}
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
      />
    </div>
  );
}