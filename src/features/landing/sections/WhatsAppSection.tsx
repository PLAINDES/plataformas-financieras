import { useState } from "react";
import {
  Send,
  Settings,
  Phone,
  Loader2,
  UploadCloud,
  Check,
  X,
} from "lucide-react";
import { EditableText } from "@/shared/components/editable/EditableText";
import type { EditableContent } from "@/shared/types/editable.types";

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
  isAdmin: boolean;
  onSave: (content: EditableContent) => Promise<void>;
  onUploadImage?: (file: File, oldUrl?: string) => Promise<string> | undefined;
}

export function WhatsAppSection({
  content,
  isAdmin,
  onSave,
  onUploadImage,
}: WhatsAppSectionProps) {
  const [userMessage, setUserMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<
    string | null
  >(null);

  if (!content && !isAdmin) return null;

  const handleWhatsAppClick = () => {
    if (content?.whatsappNumber) {
      const cleanNumber = content.whatsappNumber.replace(/[^0-9]/g, "");
      // Si el usuario escribió algo, usamos eso. Si no, usamos el defaultMessage.
      const finalMessage =
        userMessage.trim() !== ""
          ? userMessage
          : content.defaultMessage ||
            "Hola, me gustaría recibir más información.";

      const encodedMessage = encodeURIComponent(finalMessage);
      window.open(
        `https://wa.me/${cleanNumber}?text=${encodedMessage}`,
        "_blank"
      );
      setUserMessage(""); // Limpiar después de enviar
    }
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
          section: "whatsapp-home",
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
    <section
      className="py-16 md:py-24 bg-slate-50 relative flex flex-col items-center justify-center overflow-hidden"
      id="whatsapp-direct"
    >
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-green-200/40 rounded-full blur-3xl mix-blend-multiply" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl mix-blend-multiply" />
      </div>

      <div className="container mx-auto px-4 z-10 flex flex-col items-center">
        {/* Textos Principales */}
        <div className="text-center mb-10">
          <EditableText
            content={{
              value: content?.title || "¿Tienes alguna consulta?",
              id: "title",
              type: "text",
              section: "whatsapp-home",
            }}
            onSave={onSave}
            as="h2"
            className="text-2xl md:text-3xl font-bold text-slate-900 mb-4"
          />
          <EditableText
            content={{
              value:
                content?.description ||
                "Escríbenos directamente por WhatsApp y un asesor te responderá a la brevedad.",
              id: "description",
              type: "text",
              section: "whatsapp-home",
            }}
            onSave={onSave}
            as="p"
            className="text-slate-600 max-w-md mx-auto"
          />
        </div>

        {/* MOCKUP CELULAR */}
        <div className="w-full max-w-85 bg-[#EFEAE2] rounded-[2.5rem] shadow-2xl border-[6px] border-white overflow-hidden relative flex flex-col transform transition-transform hover:-translate-y-2 duration-300">
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

            {/* Nombre y Estado Editables */}
            <div className="flex-1 flex flex-col justify-center">
              <EditableText
                content={{
                  value: content?.agentName || "Asesoría Comercial",
                  id: "agentName",
                  type: "text",
                  section: "whatsapp-home",
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
                  section: "whatsapp-home",
                }}
                onSave={onSave}
                as="p"
                className="text-white/80 text-[11px] outline-none focus:bg-white/20 px-1 rounded w-fit"
              />
            </div>
          </div>

          {/* Cuerpo del Chat */}
          <div className="p-4 h-60 flex flex-col justify-start pt-6 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
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
                    section: "whatsapp-home",
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
          <div className="bg-[#F0F0F0] px-3 py-3 flex items-center gap-2">
            <div className="flex-1 bg-white rounded-full relative shadow-sm overflow-hidden flex items-center">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  content?.inputPlaceholder || "Escribe un mensaje..."
                }
                className="w-full px-4 py-2.5 text-slate-700 text-sm outline-none bg-transparent"
              />
            </div>

            <button
              onClick={handleWhatsAppClick}
              title="Abrir chat en WhatsApp"
              className="w-11 h-11 bg-[#128C7E] hover:bg-[#075E54] active:scale-95 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all cursor-pointer group"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Panel Admin: Número y Mensaje Default (ocultos de la UI) */}
        {isAdmin && (
          <div className="w-full max-w-85 mt-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                Configuración de WhatsApp
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex text-[11px] font-bold text-slate-500 uppercase mb-1.5 items-center gap-1.5">
                  <Phone className="w-3 h-3" /> Número destino
                </label>
                <div className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#2FA4FF] transition-all">
                  <EditableText
                    content={{
                      value: content?.whatsappNumber || "51999999999",
                      id: "whatsappNumber",
                      type: "text",
                      section: "whatsapp-home",
                    }}
                    onSave={onSave}
                    as="p"
                    className="mb-0 text-slate-700 font-mono text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Mensaje si el usuario no escribe nada
                </label>
                <div className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#2FA4FF] transition-all">
                  <EditableText
                    content={{
                      value:
                        content?.defaultMessage ||
                        "Hola, me gustaría recibir más información.",
                      id: "defaultMessage",
                      type: "text",
                      section: "whatsapp-home",
                    }}
                    onSave={onSave}
                    as="p"
                    className="mb-0 text-slate-700 text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Placeholder del input
                </label>
                <div className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#2FA4FF] transition-all">
                  <EditableText
                    content={{
                      value:
                        content?.inputPlaceholder || "Escribe un mensaje...",
                      id: "inputPlaceholder",
                      type: "text",
                      section: "whatsapp-home",
                    }}
                    onSave={onSave}
                    as="p"
                    className="mb-0 text-slate-700 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
