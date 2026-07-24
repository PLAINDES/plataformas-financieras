// src/components/editable/EditableImage.tsx

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { EditableContent } from "../../types/editable.types";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { api } from "@/shared/services/api";
import {
    Loader2,
    UploadCloud,
    Link as LinkIcon,
    Image as ImageIcon,
    X,
} from "lucide-react";

interface EditableImageProps {
    content: EditableContent;
    onSave: (content: EditableContent) => Promise<void>;
    className?: string;
    alt?: string;
    uploadEndpoint?: string;
}

export function EditableImage({
    content,
    onSave,
    className = "",
    alt = "Image",
    uploadEndpoint = "/api/v1/cms/contents/upload-image",
}: EditableImageProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [imageUrl, setImageUrl] = useState(content.value);
    const [previewUrl, setPreviewUrl] = useState(content.value);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
    const [hasError, setHasError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isAdmin, getToken } = useAuthContext();

    const isEmpty = !content.value || content.value.trim() === "";
    const showPlaceholder = isEmpty || hasError;

    useEffect(() => {
        setHasError(false);
        setImageUrl(content.value);
        setPreviewUrl(content.value);
    }, [content.value]);

    const isPlaceholderUrl = (url: string) => {
        return !url || url.includes("via.placeholder.com") || url.includes("placeholder.com");
    };

    const verifyImageUrl = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Por favor selecciona una imagen válida");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("La imagen no debe superar 5MB");
            return;
        }

        setIsUploading(true);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        try {
            const formData = new FormData();
            formData.append("file", file);
            if (!isPlaceholderUrl(content.value)) {
                formData.append("old_url", content.value);
            }

            const data = await api.postForm<{ success: boolean; media?: { url: string } }>(
                uploadEndpoint,
                formData,
                { token: getToken() || undefined }
            );

            const uploadedUrl = data?.media?.url;

            if (!uploadedUrl) {
                throw new Error("El servidor no devolvió una URL válida");
            }

            const isReachable = await verifyImageUrl(uploadedUrl);
            if (!isReachable) {
                throw new Error("La imagen se subió pero no se puede visualizar. Verifica la configuración de almacenamiento (S3) o la URL devuelta.");
            }

            setImageUrl(uploadedUrl);
            setPreviewUrl(uploadedUrl);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert(error instanceof Error ? error.message : "Error al subir la imagen. Intenta nuevamente.");
            setPreviewUrl(content.value);
            setImageUrl(content.value);
        } finally {
            URL.revokeObjectURL(objectUrl);
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (imageUrl === content.value) {
            setIsEditing(false);
            return;
        }

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
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <>
            {/* IMAGEN BASE / PLACEHOLDER: Siempre editable para admin */}
            <div
                className={`relative inline-block ${isAdmin ? "cursor-pointer group" : ""}`}
                onClick={() => isAdmin && setIsEditing(true)}
            >
                {showPlaceholder ? (
                    <div
                        className={`
              ${className}
              flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg
              ${isAdmin ? "hover:bg-slate-200 hover:border-blue-400 transition-all duration-200" : ""}
            `}
                    >
                        <div className="flex flex-col items-center gap-1 px-2 text-center">
                            <ImageIcon className={`w-5 h-5 ${isAdmin ? "text-blue-500" : "text-slate-400"}`} />
                            {isAdmin && (
                                <span className="text-[10px] font-semibold text-slate-500 leading-tight">
                                    {isEmpty ? "Agregar imagen" : "Imagen no disponible"}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <img
                        src={content.value}
                        alt={alt}
                        className={`
              ${className}
              ${isAdmin ? "transition-all duration-200 group-hover:ring-4 group-hover:ring-blue-500/50 group-hover:brightness-90" : ""}
            `}
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            setHasError(true);
                        }}
                    />
                )}
                {isAdmin && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Editar
                    </div>
                )}
            </div>

            {/* MODAL TAILWIND: Limpio, centrado y bloqueando el fondo */}
            {isEditing &&
                createPortal(
                    <div className="fixed inset-0 z-300 flex items-center justify-center p-4 sm:p-6">
                        <div
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                            onClick={handleCancel}
                        />

                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-blue-600" />
                                    Editar Imagen
                                </h3>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving || isUploading}
                                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <div className="mb-6 border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 flex justify-center items-center min-h-50 relative">
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                            <span className="text-sm font-medium text-slate-500">
                                                Subiendo imagen...
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="max-w-full max-h-70 rounded-lg object-contain shadow-sm"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.style.display = "none";
                                                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                    if (placeholder) placeholder.style.display = "flex";
                                                }}
                                            />
                                            <div className="hidden flex-col items-center justify-center gap-2 text-slate-400">
                                                <ImageIcon className="w-10 h-10" />
                                                <span className="text-sm font-medium">Vista previa no disponible</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-2 mb-6 border-b border-slate-200">
                                    <button
                                        onClick={() => setUploadMethod("file")}
                                        disabled={isSaving || isUploading}
                                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${uploadMethod === "file"
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-slate-500 hover:text-slate-700"
                                            }`}
                                    >
                                        <UploadCloud className="w-4 h-4" /> Subir archivo
                                    </button>
                                    <button
                                        onClick={() => setUploadMethod("url")}
                                        disabled={isSaving || isUploading}
                                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${uploadMethod === "url"
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-slate-500 hover:text-slate-700"
                                            }`}
                                    >
                                        <LinkIcon className="w-4 h-4" /> URL externa
                                    </button>
                                </div>

                                {uploadMethod === "file" && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Seleccionar imagen de tu equipo
                                        </label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            disabled={isSaving || isUploading}
                                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-xs text-slate-500 mt-2">
                                            Formatos recomendados: JPG, PNG, WebP • Máximo: 5MB
                                        </p>
                                    </div>
                                )}

                                {uploadMethod === "url" && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            URL pública de la imagen
                                        </label>
                                        <input
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => {
                                                setImageUrl(e.target.value);
                                                setPreviewUrl(e.target.value);
                                            }}
                                            disabled={isSaving || isUploading}
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-700"
                                        />

                                        {imageUrl !== content.value && (
                                            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                                <span className="text-xs font-bold text-blue-800 block mb-1">
                                                    Nueva URL:
                                                </span>
                                                <code className="text-xs text-blue-600 break-all">
                                                    {imageUrl}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving || isUploading}
                                    className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={
                                        isSaving || isUploading || imageUrl === content.value
                                    }
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:bg-slate-400 flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                                        </>
                                    ) : (
                                        "Guardar cambios"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
