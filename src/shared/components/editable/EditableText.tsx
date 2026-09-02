// src/components/editable/EditableText.tsx

import { useState, useRef, useEffect } from "react";
import type { EditableContent } from "../../types/editable.types";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";

interface EditableTextProps {
  content: EditableContent;
  onSave: (content: EditableContent) => Promise<void>;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  singleLine?: boolean;
}

export function EditableText({
  content,
  onSave,
  className = "",
  as: Component = "p",
  singleLine = false,
}: EditableTextProps) {
  const isWhatsAppField = content.id === "whatsappNumber";
  const formatWhatsAppDisplay = (raw: string) => {
    if (!raw) return "";
    const trimmed = raw.trim();
    // si no empieza con + pero tiene dígitos, igual formatea con +51 para preview
    const hasPlus = trimmed.startsWith("+");
    const digits = trimmed.replace(/[^0-9]/g, "");
    if (!digits) return hasPlus ? "+" : "";
    let core = digits;
    // si viene sin prefijo, no fuerza 51 en display solo si ya tiene valor
    if (core.length <= 2) return `+${core}`;
    if (core.length <= 5) return `+${core.slice(0, 2)} ${core.slice(2)}`;
    if (core.length <= 8) return `+${core.slice(0, 2)} ${core.slice(2, 5)} ${core.slice(5)}`;
    if (core.length <= 11) return `+${core.slice(0, 2)} ${core.slice(2, 5)} ${core.slice(5, 8)} ${core.slice(8)}`;
    return `+${core.slice(0, 2)} ${core.slice(2, 5)} ${core.slice(5, 8)} ${core.slice(8, 11)}`;
  };
  const getWhatsAppError = (raw: string): string | null => {
    if (!isWhatsAppField) return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (!trimmed.startsWith("+")) return "prefijo invalido";
    const digits = trimmed.replace(/[^0-9]/g, "");
    if (digits.length >= 2 && !digits.startsWith("51")) return "prefijo no registrado";
    return null;
  };
  const formatForSave = (raw: string) => {
    if (!isWhatsAppField) return raw;
    // guarda tal cual con + y dígitos limpios, permite borrar todo
    const trimmed = raw.trim();
    if (!trimmed) return "";
    return trimmed;
  };
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content.value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
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
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing]);

  const handleSave = async () => {
    const toSave = formatForSave(value);
    const originalClean = formatForSave(content.value);
    if (toSave === originalClean) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ ...content, value: toSave });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error al guardar. Intenta nuevamente.");
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
    if (e.key === "Enter") {
      if (singleLine) {
        e.preventDefault();
        handleSave();
      } else if (e.ctrlKey) {
        handleSave();
      }
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isAdmin) {
    const display = isWhatsAppField ? formatWhatsAppDisplay(content.value) : content.value;
    return <Component className={className}>{display || (isWhatsAppField ? "+51" : "")}</Component>;
  }

  if (isEditing) {
    const error = getWhatsAppError(value);
    const hasError = !!error;
    return (
      <div ref={containerRef} className="relative inline-block min-w-50 w-full">
        {/* Input de edición */}
        {singleLine ? (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => {
              // permite borrar +51 y editar libre, solo limita longitud visual
              setValue(e.target.value.slice(0, 20));
            }}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            placeholder={isWhatsAppField ? "+51 xxx xxx xxx" : undefined}
            className={`w-full min-h-10 p-2 border-2 rounded-md shadow-lg outline-none bg-white text-inherit font-inherit leading-inherit ${hasError ? "border-red-500 focus:border-red-500" : "border-blue-500"}`}
          />
        ) : (
          <textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            rows={1}
            className="w-full min-h-10 p-2 border-2 border-blue-500 rounded-md shadow-lg outline-none resize-y bg-white text-inherit font-inherit leading-inherit"
          />
        )}

        {/* Validación WhatsApp */}
        {hasError && <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
        {/* Preview formateado solo visual */}
        {isWhatsAppField && value.trim() && !hasError && (
          <p className="mt-1 text-xs text-gray-500 tracking-wide">{formatWhatsAppDisplay(value)}</p>
        )}
        {/* Panel compacto debajo - dentro del contenedor */}
        <div className="mt-2 bg-white border border-gray-200 rounded-md p-2 shadow-sm flex flex-col gap-2">
          <div className="flex justify-center gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-1.5 border border-gray-300 bg-white rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !!hasError}
              className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isSaving ? "..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Component
      className={`
        ${className} 
        relative cursor-pointer transition-all duration-200 min-h-[1.5rem] min-w-[6rem] inline-block
        outline-2 outline-dashed outline-transparent hover:outline-blue-500
        hover:bg-blue-50/30 rounded px-1
      `}
      onClick={() => setIsEditing(true)}
      title="Click para editar"
    >
      {isWhatsAppField
        ? formatWhatsAppDisplay(content.value) || <span className="text-gray-400">+51 xxx xxx xxx</span>
        : content.value || <span className="text-gray-400">—</span>}
    </Component>
  );
}
