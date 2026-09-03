import { useState } from "react";
import {
    Send,
    Loader2,
    UploadCloud,
    Check,
    X,
} from "lucide-react";
import { EditableText } from "@/shared/components/editable/EditableText";
import type { EditableContent } from "@/shared/types/editable.types";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";
import { buildWhatsAppUrl } from "@/shared/utils/whatsapp";

export const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 256 259"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid"
        className={className}
    >
        <path
            d="m67.663 221.823 4.185 2.093c17.44 10.463 36.971 15.346 56.503 15.346 61.385 0 111.609-50.224 111.609-111.609 0-29.297-11.859-57.897-32.785-78.824-20.927-20.927-48.83-32.785-78.824-32.785-61.385 0-111.61 50.224-110.912 112.307 0 20.926 6.278 41.156 16.741 58.594l2.79 4.186-11.16 41.156 41.853-10.464Z"
            fill="#00E676"
        />
        <path
            d="M219.033 37.668C195.316 13.254 162.531 0 129.048 0 57.898 0 .698 57.897 1.395 128.35c0 22.322 6.278 43.947 16.742 63.478L0 258.096l67.663-17.439c18.834 10.464 39.76 15.347 60.688 15.347 70.453 0 127.653-57.898 127.653-128.35 0-34.181-13.254-66.269-36.97-89.986ZM129.048 234.38c-18.834 0-37.668-4.882-53.712-14.648l-4.185-2.093-40.458 10.463 10.463-39.76-2.79-4.186C7.673 134.63 22.322 69.058 72.546 38.365c50.224-30.692 115.097-16.043 145.79 34.181 30.692 50.224 16.043 115.097-34.18 145.79-16.045 10.463-35.576 16.043-55.108 16.043Zm61.385-77.428-7.673-3.488s-11.16-4.883-18.136-8.371c-.698 0-1.395-.698-2.093-.698-2.093 0-3.488.698-4.883 1.396 0 0-.697.697-10.463 11.858-.698 1.395-2.093 2.093-3.488 2.093h-.698c-.697 0-2.092-.698-2.79-1.395l-3.488-1.395c-7.673-3.488-14.648-7.674-20.229-13.254-1.395-1.395-3.488-2.79-4.883-4.185-4.883-4.883-9.766-10.464-13.253-16.742l-.698-1.395c-.697-.698-.697-1.395-1.395-2.79 0-1.395 0-2.79.698-3.488 0 0 2.79-3.488 4.882-5.58 1.396-1.396 2.093-3.488 3.488-4.883 1.395-2.093 2.093-4.883 1.395-6.976-.697-3.488-9.068-22.322-11.16-26.507-1.396-2.093-2.79-2.79-4.883-3.488H83.01c-1.396 0-2.79.698-4.186.698l-.698.697c-1.395.698-2.79 2.093-4.185 2.79-1.395 1.396-2.093 2.79-3.488 4.186-4.883 6.278-7.673 13.951-7.673 21.624 0 5.58 1.395 11.161 3.488 16.044l.698 2.093c6.278 13.253 14.648 25.112 25.81 35.575l2.79 2.79c2.092 2.093 4.185 3.488 5.58 5.58 14.649 12.557 31.39 21.625 50.224 26.508 2.093.697 4.883.697 6.976 1.395h6.975c3.488 0 7.673-1.395 10.464-2.79 2.092-1.395 3.487-1.395 4.882-2.79l1.396-1.396c1.395-1.395 2.79-2.092 4.185-3.487 1.395-1.395 2.79-2.79 3.488-4.186 1.395-2.79 2.092-6.278 2.79-9.765v-4.883s-.698-.698-2.093-1.395Z"
            fill="#FFF"
        />
    </svg>
);

interface WhatsAppSectionProps {
    content?: {
        title?: string;
        description?: string;
        whatsappNumber?: string;
        defaultMessage?: string;
        agentName?: string;
        agentStatus?: string;
        agentAvatar?: string;
        agentGreetingMessage?: string;
        inputPlaceholder?: string;
    };
    onSave: (content: EditableContent) => Promise<void>;
    onUploadImage?: (file: File, oldUrl?: string) => Promise<string> | undefined;
    isOpen?: boolean;
    onToggle?: (open: boolean) => void;
}

export function WhatsAppSection({
    content,
    onSave,
    onUploadImage,
    isOpen: controlledIsOpen,
    onToggle,
}: WhatsAppSectionProps) {
    const { isAdmin } = useAuthContext();
    const { trackEvent } = useAnalytics();
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isOpen = controlledIsOpen ?? internalIsOpen;
    const setIsOpen = (val: boolean) => {
        setInternalIsOpen(val);
        onToggle?.(val);
    };
    const [userMessage, setUserMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
    const [pendingAvatarPreview, setPendingAvatarPreview] = useState<
        string | null
    >(null);

    const handleWhatsAppClick = () => {
        trackEvent("cta_whatsapp_click", { location: "floating_chat" });
        const rawInput = content?.whatsappNumber || "";
        if (!rawInput) {
            alert("No hay enlace de WhatsApp configurado.");
            return;
        }
        const customMessage =
            userMessage.trim() !== ""
                ? userMessage
                : content?.defaultMessage || undefined;
        const finalUrl = buildWhatsAppUrl(rawInput, customMessage);
        if (!finalUrl) {
            alert("No se encontró número de teléfono en el enlace de WhatsApp.");
            return;
        }
        window.open(finalUrl, "_blank");
        setUserMessage("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleWhatsAppClick();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPendingAvatarFile(file);
        setPendingAvatarPreview(URL.createObjectURL(file));

        if (e.target) e.target.value = "";
    };

    const cancelAvatarUpload = () => {
        setPendingAvatarFile(null);
        if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
        setPendingAvatarPreview(null);
    };

    const confirmAvatarUpload = async () => {
        if (!pendingAvatarFile || !onUploadImage) return;

        setIsUploading(true);
        try {
            const newUrl = await onUploadImage(
                pendingAvatarFile,
                content?.agentAvatar
            );
            if (newUrl) {
                const updatedData = { ...content, agentAvatar: newUrl };
                await onSave({
                    id: "agentAvatar",
                    value: newUrl,
                    type: "text",
                    section: "cta-home",
                    data: updatedData,
                });
            }
        } catch (error) {
            console.error("Error al subir avatar:", error);
            alert("Error al subir la imagen.");
        } finally {
            setIsUploading(false);
            cancelAvatarUpload();
        }
    };

    const currentAvatarSrc =
        pendingAvatarPreview ||
        (content?.agentAvatar &&
            content.agentAvatar !== "https://via.placeholder.com/150"
            ? content.agentAvatar
            : "https://ui-avatars.com/api/?name=Asesor&background=0D8BD9&color=fff");

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none">
            {/* MOCKUP CELULAR (Chat Window) */}
            <div
                className={`
                    w-[320px] md:w-[350px] bg-[#EFEAE2] rounded-[1.5rem] shadow-2xl border-4 border-white overflow-hidden relative flex flex-col pointer-events-auto
                    transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${isOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 translate-y-4 pointer-events-none"
                    }
                `}
            >
                    {/* Header del Chat */}
                    <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3 shadow-md z-10">
                        {/* Avatar Editable */}
                        <div className="relative">
                            <div className="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0 group overflow-hidden">
                                {isUploading ? (
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                    <img
                                        src={currentAvatarSrc}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                {isAdmin && !pendingAvatarPreview && !isUploading && (
                                    <label className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                                        <UploadCloud className="w-4 h-4 text-white" />
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                    </label>
                                )}
                            </div>
                            {/* Botones de Confirmación Flotantes */}
                            {isAdmin && pendingAvatarPreview && !isUploading && (
                                <div className="absolute top-12 -left-2 bg-white rounded-lg shadow-xl border border-slate-200 p-1.5 flex gap-1 z-50">
                                    <button
                                        onClick={cancelAvatarUpload}
                                        className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                        title="Cancelar"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={confirmAvatarUpload}
                                        className="w-7 h-7 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                        title="Guardar Imagen"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Nombre, Estado y Número Editables */}
                        <div className="flex-1 flex flex-col justify-center">
                            <EditableText
                                content={{
                                    value: content?.agentName || "Asesoría Comercial",
                                    id: "agentName",
                                    type: "text",
                                    section: "cta-home",
                                }}
                                onSave={onSave}
                                as="h3"
                                className="text-white font-semibold text-sm leading-tight outline-none focus:bg-white/20 px-1 rounded"
                            />
                            <EditableText
                                content={{
                                    value: content?.agentStatus || "en línea",
                                    id: "agentStatus",
                                    type: "text",
                                    section: "cta-home",
                                }}
                                onSave={onSave}
                                as="p"
                                className="text-white/80 text-[11px] outline-none focus:bg-white/20 px-1 rounded w-fit"
                            />
                        </div>

                        {/* Botón cerrar minichat */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/70 hover:text-white transition-colors p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Cuerpo del Chat */}
                    <div className="p-4 h-64 flex flex-col justify-start pt-6 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
                        {/* Burbuja Entrante (Saludo del Asesor) */}
                        <div className="bg-white p-3 rounded-xl rounded-tl-none self-start max-w-[90%] shadow-sm relative group cursor-text">
                            <div
                                className="absolute top-0 -left-2 w-3 h-3 bg-white"
                                style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
                            />
                            <div className="text-sm text-slate-800 leading-snug wrap-break-word">
                                <EditableText
                                    content={{
                                        value:
                                            content?.agentGreetingMessage ||
                                            "¡Hola! ¿En qué te podemos ayudar el día de hoy?",
                                        id: "agentGreetingMessage",
                                        type: "text",
                                        section: "cta-home",
                                    }}
                                    onSave={onSave}
                                    as="div"
                                    className="outline-none focus:ring-2 focus:ring-green-400 rounded px-1 transition-all"
                                />
                            </div>
                            <div className="flex justify-end items-center gap-1 mt-1">
                                <span className="text-[10px] text-slate-400">
                                    {new Date().toLocaleTimeString("es-PE", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Input de Envío */}
                    <div className="bg-[#F0F0F0] px-3 py-3 flex items-center gap-2 pointer-events-auto">
                        <div className="flex-1 bg-white rounded-full relative shadow-sm overflow-hidden flex items-center pointer-events-auto">
                            <input
                                type="text"
                                value={userMessage}
                                onChange={(e) => setUserMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    content?.inputPlaceholder || "Escribe un mensaje..."
                                }
                                className="w-full px-4 py-2.5 text-slate-700 text-sm outline-none bg-transparent pointer-events-auto"
                            />
                        </div>

                        <button
                            onClick={handleWhatsAppClick}
                            title="Abrir chat en WhatsApp"
                            className="w-11 h-11 bg-[#128C7E] hover:bg-[#075E54] active:scale-95 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all cursor-pointer group pointer-events-auto"
                        >
                            <Send className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

            {/* BOTÓN FLOTANTE PRINCIPAL */}
            <div className="relative pointer-events-auto">
                <div
                    className={`
                        absolute -top-12 right-0 bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 text-slate-800 text-sm font-semibold whitespace-nowrap flex items-center gap-2
                        transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
                        ${isOpen
                            ? "opacity-0 translate-y-2 scale-95 pointer-events-none"
                            : "opacity-100 translate-y-0 scale-100"
                        }
                    `}
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    ¿En qué podemos ayudarte?
                    <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-slate-100 rotate-45" />
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(37,211,102,0.4)] transition-all duration-500 active:scale-90 group ${isOpen
                        ? "bg-white text-slate-600 rotate-180"
                        : "bg-[#25D366] text-white hover:scale-110 hover:shadow-[0_15px_50px_rgba(37,211,102,0.6)]"
                        }`}
                    title={isOpen ? "Cerrar" : "Escríbenos por WhatsApp"}
                >
                    {isOpen ? (
                        <X className="w-8 h-8 transition-transform duration-500" />
                    ) : (
                        <div className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-110">
                            <WhatsAppIcon className="w-full h-full drop-shadow-md" />
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
