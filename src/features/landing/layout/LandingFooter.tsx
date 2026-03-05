// src/features/landing/layout/LandingFooter.tsx
import { useState } from 'react';
import type { FormEvent } from 'react'
import { Pencil } from 'lucide-react';
import { EditableText } from '@/shared/components/editable/EditableText';
import { FooterEditModal } from './FooterEditModal';
import { useAuthContext } from '@/features/auth/hooks/useAuthContext';
import type { EditableContent } from '@/shared/types/editable.types';

interface FooterLink {
  id: string;
  url: string;
  label: string;
}

interface FooterSection {
  id: string
  title: string;
  links: FooterLink[];
}

interface FooterContent {
  sections: FooterSection[];
  copyright: string;
}

interface LandingFooterProps {
  content: FooterContent;
  onSave: (updated: FooterContent) => Promise<void>;
}

export function LandingFooter({ content, onSave }: LandingFooterProps) {
  const [email, setEmail] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { isAdmin } = useAuthContext();

  const handleSubscription = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Email subscription:', email);
    setEmail('');
  };

  const handleSaveCopyright = async (editable: EditableContent) => {
    await onSave({ ...content, copyright: editable.value as string });
  };

  if (!content) return null;
  console.log("content", content)
  return (
    <footer className="mb-0 relative">

      {/* Botón flotante editar — solo admin, esquina superior derecha del footer */}
      {isAdmin && (
        <button
          onClick={() => setEditModalOpen(true)}
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium backdrop-blur-sm border border-white/15 transition-all shadow-sm"
          title="Editar footer"
        >
          <Pencil size={11} />
          Editar footer
        </button>
      )}

      <div className="bs-landing-footer pt-8 pb-4">

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">

            {/* Izquierda: Logo & Suscripción */}
            <div className="lg:col-span-4">
              <div className="mb-4">
                <img alt="Logo" src="/images/logo.png" className="h-[40px] object-contain" />
              </div>
              <div>
                <h3 className="text-gray-300 text-sm font-medium mb-3 leading-relaxed">
                  Suscríbete para recibir actualizaciones
                </h3>
                <form onSubmit={handleSubscription} className="formSuscription">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-600 bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="tu@email.com"
                      required
                    />
                    <button type="submit" className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap font-medium">
                      Enviar
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Derecha: Secciones del CMS — solo lectura */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {(content.sections ?? []).map((section, si) => (
                  <div key={si}>
                    <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
                      {section.title}
                    </h4>
                    <ul className="space-y-2">
                      {(section.links ?? []).map((link, li) => (
                        <li key={li}>
                          <a href={link.url} className="text-gray-300 hover:text-white text-sm transition-colors inline-block">
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="container mx-auto px-4 mt-6 mb-3">
          <div className="border-t border-white/10" />
        </div>

        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <EditableText
              content={{ id: 'footer_copyright', type: 'text', section: 'footer', value: content.copyright }}
              onSave={handleSaveCopyright}
              as="p"
              className="text-gray-400 text-xs text-center"
            />
          </div>
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