import { EditableText } from '../../../components/editable/EditableText';
import type { HeroContent } from '../../../types/landing.types';
import type { EditableContent } from '../../../types/editable.types';

interface HeroSectionProps {
  content: HeroContent;
  isAdmin: boolean;
  onSave: (content: EditableContent) => Promise<void>;
}

export function HeroSection({ content, isAdmin, onSave }: HeroSectionProps) {
  const titleContent: EditableContent = {
    id: 'hero_title',
    type: 'text',
    value: content.title,
    section: 'hero',
  };

  const descriptionContent: EditableContent = {
    id: 'hero_description',
    type: 'text',
    value: content.description,
    section: 'hero',
  };

  return (
    <div id="plataformas">
      
      <div className="d-flex flex-column flex-center w-100">
        <div className="text-center  bs-content-1" >
          <div className="row d-flex justify-content-center">
            <div className="col-12 col-lg-10">
              <EditableText
                content={titleContent}
                isAdmin={isAdmin}
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
