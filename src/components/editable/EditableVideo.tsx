// src/components/editable/EditableVideo.tsx

import { useState, useRef } from 'react';
import type { VideoData } from '../../types/editable.types';
import { useAuthContext } from '../../hooks/useAuthContext';

interface EditableVideoProps {
  video: VideoData;
  onSave: (video: VideoData) => Promise<void>;
  uploadEndpoint?: string;
  className?: string;
  showControls?: boolean;
}

export function EditableVideo({
  video,
  onSave,
  uploadEndpoint = '/api/upload/video',
  className = '',
  showControls = true,
}: EditableVideoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [videoData, setVideoData] = useState<VideoData>(video);
  const [previewSrc, setPreviewSrc] = useState(video.src);
  const [previewPoster, setPreviewPoster] = useState(video.poster);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const posterFileRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
const { isAdmin } = useAuthContext();
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('video/')) {
      alert('Por favor selecciona un video válido (mp4, webm, etc.)');
      return;
    }

    // Validar tamaño (máx 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('El video no debe superar 100MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Crear preview local con ObjectURL
      const objectUrl = URL.createObjectURL(file);
      setPreviewSrc(objectUrl);

      // Subir al servidor con progress
      const formData = new FormData();
      formData.append('video', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          const uploadedUrl = data.url || data.videoUrl || data.path;

          if (!uploadedUrl) {
            throw new Error('El servidor no devolvió una URL válida');
          }

          setVideoData({ ...videoData, type: 'upload', src: uploadedUrl });
          setPreviewSrc(uploadedUrl);
          URL.revokeObjectURL(objectUrl);
          alert('Video subido correctamente. Haz clic en "Guardar" para confirmar.');
        } else {
          throw new Error('Error al subir el video');
        }
        setIsUploading(false);
      });

      xhr.addEventListener('error', () => {
        throw new Error('Error de red al subir el video');
      });

      xhr.open('POST', uploadEndpoint);
      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error al subir el video. Intenta nuevamente.');
      setPreviewSrc(video.src);
      setVideoData(video);
      setIsUploading(false);
    }
  };

  const handlePosterFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const objectUrl = URL.createObjectURL(file);
      setPreviewPoster(objectUrl);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error al subir poster');

      const data = await response.json();
      const uploadedUrl = data.url || data.imageUrl || data.path;

      setVideoData({ ...videoData, poster: uploadedUrl });
      setPreviewPoster(uploadedUrl);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error uploading poster:', error);
      alert('Error al subir el poster. Intenta nuevamente.');
      setPreviewPoster(video.poster);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (videoData.src === video.src && videoData.poster === video.poster) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(videoData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar. Intenta nuevamente.');
      setVideoData(video);
      setPreviewSrc(video.src);
      setPreviewPoster(video.poster);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setVideoData(video);
    setPreviewSrc(video.src);
    setPreviewPoster(video.poster);
    setIsEditing(false);
    setUploadMethod('file');
    setUploadProgress(0);
    if (videoFileRef.current) videoFileRef.current.value = '';
    if (posterFileRef.current) posterFileRef.current.value = '';
  };

  if (!isAdmin) {
    return (
      <video
        src={video.src}
        poster={video.poster}
        className={className}
        controls={showControls}
        style={{ width: '100%', aspectRatio: '16 / 9' }}
      />
    );
  }

  if (isEditing) {
    return (
      <>
        {/* Modal Overlay */}
        <div
          onClick={handleCancel}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
          }}
        />

        {/* Modal Content */}
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h5 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
              Editar Video
            </h5>
            <button
              onClick={handleCancel}
              disabled={isSaving || isUploading}
              style={{
                border: 'none',
                background: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '0',
                width: '32px',
                height: '32px',
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '20px' }}>
            {/* Preview */}
            <div style={{ marginBottom: '24px' }}>
              <video
                ref={videoPreviewRef}
                src={previewSrc}
                poster={previewPoster}
                controls
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  borderRadius: '8px',
                  backgroundColor: '#000',
                }}
              />
            </div>

            {/* Progress Bar */}
            {isUploading && uploadProgress > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      backgroundColor: '#3b82f6',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  Subiendo: {uploadProgress}%
                </small>
              </div>
            )}

            {/* Method Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <button
                onClick={() => setUploadMethod('file')}
                disabled={isSaving || isUploading}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'none',
                  borderBottom: `2px solid ${uploadMethod === 'file' ? '#3b82f6' : 'transparent'}`,
                  color: uploadMethod === 'file' ? '#3b82f6' : '#6b7280',
                  fontWeight: uploadMethod === 'file' ? '600' : '400',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                📤 Subir video
              </button>
              <button
                onClick={() => setUploadMethod('url')}
                disabled={isSaving || isUploading}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'none',
                  borderBottom: `2px solid ${uploadMethod === 'url' ? '#3b82f6' : 'transparent'}`,
                  color: uploadMethod === 'url' ? '#3b82f6' : '#6b7280',
                  fontWeight: uploadMethod === 'url' ? '600' : '400',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                🔗 URL externa
              </button>
            </div>

            {/* Upload File Panel */}
            {uploadMethod === 'file' && (
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  Seleccionar video
                </label>
                <input
                  ref={videoFileRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  disabled={isSaving || isUploading}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                />
                <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>
                  Formatos: MP4, WebM, OGG • Máximo: 100MB
                </small>
              </div>
            )}

            {/* URL Panel */}
            {uploadMethod === 'url' && (
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  URL del video
                </label>
                <input
                  type="url"
                  value={videoData.type === 'url' ? videoData.src : ''}
                  onChange={(e) => {
                    setVideoData({ ...videoData, type: 'url', src: e.target.value });
                    setPreviewSrc(e.target.value);
                  }}
                  placeholder="https://ejemplo.com/video.mp4"
                  disabled={isSaving || isUploading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            )}

            {/* Poster */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Poster (opcional)
              </label>
              <input
                ref={posterFileRef}
                type="file"
                accept="image/*"
                onChange={handlePosterFileChange}
                disabled={isSaving || isUploading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              backgroundColor: '#f9fafb',
            }}
          >
            <button
              onClick={handleCancel}
              disabled={isSaving || isUploading}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                background: 'white',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: isSaving || isUploading ? 'not-allowed' : 'pointer',
                color: '#374151',
                fontWeight: '500',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isUploading}
              style={{
                padding: '8px 20px',
                border: 'none',
                background: isSaving || isUploading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: isSaving || isUploading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
              }}
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <video
        src={video.src}
        poster={video.poster}
        className={className}
        controls={showControls}
        onClick={() => setIsEditing(true)}
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          cursor: 'pointer',
          outline: '2px dashed transparent',
          transition: 'outline 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.outline = '2px dashed #3b82f6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.outline = '2px dashed transparent';
        }}
        title="Click para editar video"
      />
    </div>
  );
}