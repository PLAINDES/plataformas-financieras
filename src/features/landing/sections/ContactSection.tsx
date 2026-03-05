import React, { useState } from 'react';
import { EditableText } from "@/shared/components/editable/EditableText";
import { EditableImage } from '@/shared/components/editable/EditableImage';
import { EditableForm } from '@/shared/components/editable/EditableForm';
import type { EditableContent } from '@/shared/types/editable.types';
import { useAuthContext } from '../../auth/hooks/useAuthContext';

interface ContactFormConfig {
  fields: FormField[];
  submitButtonText: string;
  successMessage: string;
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea';
  placeholder: string;
  required: boolean;
  rows?: number;
}

interface ContactSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    form?: ContactFormConfig;
  };
  onSave?: (data: EditableContent) => Promise<void>;
}

export function ContactSection({ content, onSave }: ContactSectionProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { isAdmin } = useAuthContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(content.form?.successMessage || 'Form submitted successfully');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveContent = async (editableContent: EditableContent) => {
    if (!onSave) return;
    await onSave({ section: 'contact', field: editableContent.id, value: editableContent.value });
  };

  const handleSaveFormConfig = async (config: ContactFormConfig) => {
    if (!onSave) return;
    await onSave({ section: 'contact', field: 'formConfig', value: config });
  };

  return (
    <section id="contacto" className="relative w-full bg-[var(--bs-light)] overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-screen lg:min-h-[700px]">

        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:p-16 xl:p-24 bg-white lg:bg-transparent">
          <div className="max-w-xl mx-auto w-full">
            <div className="mb-8 md:mb-10 text-center lg:text-left">
              <EditableText
                content={{ value: content.title ?? 'Contáctanos', id: 'title', type: 'text', section: 'contact' }}
                onSave={onSave}
                as="h2"
                className="text-3xl md:text-4xl font-bold text-[var(--bs-dark)] mb-3 tracking-tight"
              />
              <EditableText
                content={{ value: content.subtitle ?? 'Estamos aquí para ayudarte. Envíanos un mensaje.', id: 'subtitle', type: 'text', section: 'contact' }}
                onSave={onSave}
                as="p"
                className="text-gray-500 text-lg"
              />
            </div>

            <div className="bg-white rounded-2xl p-0 lg:p-6 lg:shadow-none lg:border-none">
              <EditableForm
                config={content.form || { fields: [], submitButtonText: 'Enviar mensaje', successMessage: '¡Mensaje enviado con éxito!' }}
                onSaveConfig={handleSaveFormConfig}
                onSubmit={handleSubmit}
                formData={formData}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="hidden lg:flex w-full lg:w-1/2 bg-gray-100 relative min-h-full">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full relative">
              <EditableImage
                content={{ value: "images/web-contact.png", id: 'contact-image', type: 'image', section: 'contact' }}
                onSave={handleSaveContent}
                alt='Imagen de contacto'
                className='w-full h-full object-cover absolute inset-0'
              />
              <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}