// src/components/editable/EditableImage.tsx

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { EditableContent } from "../../types/editable.types";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isAdmin } = useAuthContext();

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

        try {
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            const formData = new FormData();
            formData.append("file", file);
            if (content.value) {
                formData.append("old_url", content.value);
            }

            const resolvedEndpoint = import.meta.env.DEV
                ? uploadEndpoint
                : `${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}${uploadEndpoint.startsWith("/") ? uploadEndpoint : `/${uploadEndpoint}`}`;

            const response = await fetch(resolvedEndpoint, {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) throw new Error("Error al subir la imagen");

            const data = await response.json();
            const uploadedUrl = data.media?.url || data.url || data.imageUrl || data.path;

            if (!uploadedUrl)
                throw new Error("El servidor no devolvió una URL válida");

            setImageUrl(uploadedUrl);
            setPreviewUrl(uploadedUrl);
            URL.revokeObjectURL(objectUrl);
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
            {/* IMAGEN BASE: Siempre renderizada, Tailwind maneja los hovers */}
            <div
                className={`relative inline-block ${isAdmin ? "cursor-pointer group" : ""}`}
                onClick={() => isAdmin && setIsEditing(true)}
            >
                <img
                    src={content.value}
                    alt={alt}
                    className={`
            ${className} 
            ${isAdmin ? "transition-all duration-200 group-hover:ring-4 group-hover:ring-blue-500/50 group-hover:brightness-90" : ""}
          `}
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                            "https://via.placeholder.com/400x300?text=Error+de+Imagen";
                    }}
                />
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
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-w-full max-h-70 rounded-lg object-contain shadow-sm"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src =
                                                    "https://via.placeholder.com/400x300?text=Vista+Previa+No+Disponible";
                                            }}
                                        />
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
