// src/components/editable/EditableImage.tsx

import { useState, useRef } from "react";
import type { EditableContent } from "../../types/editable.types";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";

interface EditableImageProps {
  content: EditableContent;
  onSave: (content: EditableContent) => Promise<void>;
  className?: string;
  alt?: string;
  uploadEndpoint?: string; // Ej: '/api/upload/image'
}

export function EditableImage({
  content,
  onSave,
  className = "",
  alt = "Image",
  uploadEndpoint = "/api/upload/image",
}: EditableImageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(content.value);
  const [previewUrl, setPreviewUrl] = useState(content.value);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAuthContext();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Crear preview local con ObjectURL (más eficiente que base64)
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Subir al servidor
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
        credentials: "include", // Incluir cookies de sesión
      });

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      const data = await response.json();
      const uploadedUrl = data.url || data.imageUrl || data.path;

      if (!uploadedUrl) {
        throw new Error("El servidor no devolvió una URL válida");
      }

      // Actualizar con la URL del servidor
      setImageUrl(uploadedUrl);
      setPreviewUrl(uploadedUrl);

      // Limpiar ObjectURL
      URL.revokeObjectURL(objectUrl);

      alert(
        'Imagen subida correctamente. Haz clic en "Guardar" para confirmar.'
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error al subir la imagen. Intenta nuevamente.");
      setPreviewUrl(content.value);
      setImageUrl(content.value);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (imageUrl === content.value) {
      setIsEditing(false);
      return;
    }

    // Validar que sea una URL válida
    try {
      new URL(imageUrl);
    } catch {
      alert("Por favor ingresa una URL válida");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ ...content, value: imageUrl });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error al guardar. Intenta nuevamente.");
      setImageUrl(content.value);
      setPreviewUrl(content.value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setImageUrl(content.value);
    setPreviewUrl(content.value);
    setIsEditing(false);
    setUploadMethod("file");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isAdmin) {
    return <img src={content.value} alt={alt} className={className} />;
  }

  if (isEditing) {
    return (
      <>
        {/* Modal Overlay */}
        <div
          onClick={handleCancel}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
          }}
        />

        {/* Modal Content */}
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10000,
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            width: "90%",
            maxWidth: "700px",
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h5 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "600" }}>
              Editar Imagen
            </h5>
            <button
              onClick={handleCancel}
              disabled={isSaving || isUploading}
              style={{
                border: "none",
                background: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#6b7280",
                padding: "0",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "20px" }}>
            {/* Preview */}
            <div
              style={{
                marginBottom: "24px",
                border: "2px dashed #d1d5db",
                borderRadius: "12px",
                padding: "20px",
                backgroundColor: "#f9fafb",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "200px",
                position: "relative",
              }}
            >
              {isUploading ? (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      border: "4px solid #e5e7eb",
                      borderTopColor: "#3b82f6",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto 12px",
                    }}
                  />
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "0.875rem",
                      margin: 0,
                    }}
                  >
                    Subiendo imagen...
                  </p>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    borderRadius: "8px",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="14"%3EImagen no válida%3C/text%3E%3C/svg%3E';
                  }}
                />
              )}
            </div>

            {/* Method Tabs */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "20px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <button
                onClick={() => setUploadMethod("file")}
                disabled={isSaving || isUploading}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "none",
                  borderBottom: `2px solid ${uploadMethod === "file" ? "#3b82f6" : "transparent"}`,
                  color: uploadMethod === "file" ? "#3b82f6" : "#6b7280",
                  fontWeight: uploadMethod === "file" ? "600" : "400",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                📤 Subir archivo
              </button>
              <button
                onClick={() => setUploadMethod("url")}
                disabled={isSaving || isUploading}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "none",
                  borderBottom: `2px solid ${uploadMethod === "url" ? "#3b82f6" : "transparent"}`,
                  color: uploadMethod === "url" ? "#3b82f6" : "#6b7280",
                  fontWeight: uploadMethod === "url" ? "600" : "400",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                🔗 URL externa
              </button>
            </div>

            {/* Upload File Panel */}
            {uploadMethod === "file" && (
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Seleccionar imagen
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSaving || isUploading}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                />
                <small
                  style={{
                    color: "#6b7280",
                    fontSize: "0.75rem",
                    display: "block",
                    marginTop: "6px",
                  }}
                >
                  Formatos: JPG, PNG, GIF, WebP • Máximo: 5MB
                </small>
              </div>
            )}

            {/* URL Panel */}
            {uploadMethod === "url" && (
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  URL de la imagen
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={isSaving || isUploading}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#3b82f6")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#d1d5db")
                  }
                />
                <small
                  style={{
                    color: "#6b7280",
                    fontSize: "0.75rem",
                    display: "block",
                    marginTop: "6px",
                  }}
                >
                  Pega la URL completa de una imagen pública
                </small>
              </div>
            )}

            {/* Current URL Display */}
            {imageUrl !== content.value && (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <strong
                  style={{
                    fontSize: "0.75rem",
                    color: "#1e40af",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Nueva URL:
                </strong>
                <code
                  style={{
                    fontSize: "0.75rem",
                    color: "#1e3a8a",
                    wordBreak: "break-all",
                    display: "block",
                  }}
                >
                  {imageUrl}
                </code>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              backgroundColor: "#f9fafb",
              borderBottomLeftRadius: "12px",
              borderBottomRightRadius: "12px",
            }}
          >
            <button
              onClick={handleCancel}
              disabled={isSaving || isUploading}
              style={{
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                background: "white",
                borderRadius: "6px",
                fontSize: "0.875rem",
                cursor: isSaving || isUploading ? "not-allowed" : "pointer",
                color: "#374151",
                fontWeight: "500",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isUploading || imageUrl === content.value}
              style={{
                padding: "8px 20px",
                border: "none",
                background:
                  isSaving || isUploading || imageUrl === content.value
                    ? "#9ca3af"
                    : "#3b82f6",
                color: "white",
                borderRadius: "6px",
                fontSize: "0.875rem",
                cursor:
                  isSaving || isUploading || imageUrl === content.value
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "500",
              }}
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        {/* Keyframes for spinner */}
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <img
        src={content.value}
        alt={alt}
        className={className}
        onClick={() => setIsEditing(true)}
        style={{
          cursor: "pointer",
          outline: "2px dashed transparent",
          transition: "outline 0.2s",
          maxWidth: "100%",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.outline = "2px dashed #3b82f6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.outline = "2px dashed transparent";
        }}
        title="Click para editar imagen"
      />
      <div
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          backgroundColor: "rgba(59, 130, 246, 0.9)",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          fontWeight: "500",
          opacity: 0,
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      >
        📝 Editar
      </div>
    </div>
  );
}
