// src/app/landing/sections/HeroSection.tsx
import { EditableText } from '../../../components/editable/EditableText';
import type { HeroContent } from '../../../types/landing.types';
import type { EditableContent } from '../../../types/editable.types';

interface HeroSectionProps {
  content: HeroContent;
  onSave: (content: EditableContent) => Promise<void>;
}

export function HeroSection({ content, onSave }: HeroSectionProps) {
  const titleContent: EditableContent = {
    id: 'hero_title',
    type: 'text',
    value: content.title,
    section: 'hero',
  };


  return (
    <div id="plataformas" className="pt-16">
      <div className="flex flex-col items-center w-full">
        <div className="text-center bs-content-1 w-full">
          <div className="flex justify-center">
            <div className="w-full lg:w-5/6">
              <EditableText
                content={titleContent}
                onSave={onSave}
                as="h1"
                className="bs-content-title"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}