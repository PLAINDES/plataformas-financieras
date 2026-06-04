import { useState } from "react";
import { WhatsAppIcon } from "@/features/landing/sections/CTASection";
import { Pencil } from "lucide-react";
import { EditableText } from "@/shared/components/editable/EditableText";
import { FooterEditModal } from "./FooterEditModal";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import type { EditableContent } from "@/shared/types/editable.types";
import { Button } from "@/components/ui/button";

interface FooterLink {
  id: string;
  url: string;
  label: string;
}

interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

interface FooterContent {
  sections: FooterSection[];
  copyright: string;
}

interface LandingFooterProps {
  content: FooterContent;
  ctaContent?: { whatsappNumber: string; text: string };
  onSave: (updated: FooterContent) => Promise<void>;
}

export function LandingFooter({
  content,
  ctaContent,
  onSave,
}: LandingFooterProps) {
  //const [email, setEmail] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { isAdmin } = useAuthContext();

  /*const handleSubscription = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Email subscription:", email);
    setEmail("");
  };*/

  const handleSaveCopyright = async (editable: EditableContent) => {
    await onSave({ ...content, copyright: editable.value as string });
  };

  const handleWhatsAppClick = () => {
    if (ctaContent?.whatsappNumber) {
      window.open(ctaContent.whatsappNumber, "_blank");
    }
  };

  if (!content) return null;

  return (
    <footer className="relative bg-slate-50 text-slate-600 border-t border-slate-200">
      {/* Botón flotante editar — solo admin */}
      {isAdmin && (
        <button
          onClick={() => setEditModalOpen(true)}
          className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
          title="Editar footer"
        >
          <Pencil size={12} strokeWidth={2.5} />
          Editar Menús
        </button>
      )}

      <div className="container mx-auto px-6 pt-16 pb-8">
        {/* Contenedor Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Columna Izquierda: Logo y Suscripción */}
          <div className="lg:col-span-5 flex flex-col items-start pr-0 lg:pr-12">
            <img
              alt="Logo"
              src="/images/logo.png"
              className="h-16 md:h-24 mb-6 object-contain"
            />
            <p className="text-sm leading-relaxed mb-4 max-w-sm text-slate-500 font-bold">
              ¿Tienes dudas? Escríbenos directamente.
            </p>
            <Button
              onClick={handleWhatsAppClick}
              className="bg-valora-primary hover:bg-valora-secondary text-white flex items-center justify-center gap-2 h-12 px-6 rounded-md transition-colors w-full max-w-60"
            >
              <WhatsAppIcon className="w-5 h-5 shrink-0" />
              <span className="truncate font-semibold text-sm">
                {ctaContent?.text || "Contáctanos por WhatsApp"}
              </span>
            </Button>
            {/*<p className="text-sm leading-relaxed mb-8 max-w-sm text-slate-500 font-bold">
              Suscríbete para recibir actualizaciones.
            </p>
            <form
              onSubmit={handleSubscription}
              className="w-full max-w-md relative"
            >
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full bg-white border border-slate-400 shadow-sm rounded-full pl-5 pr-12 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 w-9 h-9 flex items-center justify-center bg-valora-primary hover:bg-valora-secondary text-white rounded-full transition-colors cursor-pointer"
                title="Suscribirse"
              >
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </form>*/}
          </div>

          {/* Columnas Derecha: Secciones del CMS (Grid interno) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-2">
            {(content.sections ?? []).map((section, si) => (
              <div key={si}>
                <h4 className="text-slate-900 font-medium mb-5 text-sm sm:text-base">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {(section.links ?? []).map((link, li) => (
                    <li key={li}>
                      <a
                        href={link.url}
                        className="text-xs sm:text-sm text-slate-500 hover:text-blue-600 transition-colors inline-block"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center">
          <EditableText
            content={{
              id: "footer_copyright",
              type: "text",
              section: "footer",
              value: content.copyright,
            }}
            onSave={handleSaveCopyright}
            as="p"
            className="text-slate-400 text-xs text-center"
          />
        </div>
      </div>

      <FooterEditModal
        open={editModalOpen}
        content={content}
        onClose={() => setEditModalOpen(false)}
        onSave={async (updated) => {
          await onSave(updated);
        }}
      />
    </footer>
  );
}
