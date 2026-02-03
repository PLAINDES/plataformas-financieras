// src/app/landing/LandingPage.tsx
import { useEffect, useState } from 'react';
import { HeroSection } from './sections/HeroSection';
import { PlatformCardsSection } from './sections/PlatformCardsSection';
import { ClientsSection } from './sections/ClientsSection';
import { BenefitsSection } from './sections/BenefitsSection';
import { ProductsSection } from './sections/ProductsSection';
import { ContactSection } from './sections/ContactSection';
import TeamSection from './sections/TeamSection';
import { CTASection } from './sections/CTASection';
import { LandingHeader } from './components/LandingHeader';
import { ScrollTop } from '../../components/layout/ScrollTop';
import type { 
  Company,
  MenuItem,
  User,
  LoginCredentials 
} from '../../types';
import type { LandingDataResponse } from '../../types/landing.types';
import type { EditableContent, EditableCollectionData, CollectionItem } from '../../types/editable.types';
import { cmsService } from '../../services/cms.service';
import { useAuthContext } from '../../hooks/useAuthContext';

const COMPANY = {
  id: 1,
  name: 'Plataforma Finanzas',
  host: 'https://kapitals.org',
  logos: [
    { id: 1, patch: '/images/logo.png', type: 'default' },
    { id: 2, patch: '/images/diseñador.png', type: 'sticky' },
  ],
};

interface RegisterData {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

interface LandingPageProps {
  isAdmin: boolean;
  company: Company;
  user: User | null;
  onLogout: () => void;
  onLogin: (credentials: LoginCredentials) => Promise<User>;
  onRegister: (data: RegisterData) => Promise<void>;
}

export function LandingPage({ 
  company,
  isAdmin, 
  user, 
  onLogout, 
  onLogin, 
  onRegister 
}: LandingPageProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LandingDataResponse | null>(null);
  const { getToken } = useAuthContext();

  const loadData = () => {
    setLoading(true);
    cmsService.getLandingData()
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handler genérico para guardar contenido
  const handleSaveContent = async (editableContent: EditableContent) => {
    if (!getToken) {
      console.error('No token available');
      return;
    }

    try {
      // Extraer el contentId del campo id
      const contentId = getContentIdFromEditable(editableContent);
      
      if (!contentId) {
        console.error('Content ID not found for:', editableContent);
        return;
      }

      // Obtener el contenido actual para preservar otros campos
      const currentContent = getCurrentContentData(editableContent.section);
      
      // Actualizar solo el campo específico
      const updatedData = {
        ...currentContent,
        [getFieldName(editableContent.id)]: editableContent.value,
      };
      console.log('Updating content ID', contentId, 'with data:', updatedData);
      await cmsService.updateContent(
        contentId,
        { data: updatedData, status: 'published' },
        getToken()
      );

      // Recargar datos
      loadData();
      
    } catch (error) {
      console.error('Error saving content:', error);
      throw error;
    }
  };

  // Helpers para mapear EditableContent a content_id real
  const getContentIdFromEditable = (editable: EditableContent): number | null => {
    if (!data) return null;
    console.log('Getting content ID for editable:', editable);
    
    // Buscar la sección correspondiente
    const section = data.page.sections.find(s => s.name === `${editable.section}-home`);
    console.log('Found section:', section);
    if (!section || !section.contents[0]) return null;
    console.log('Found content ID:', section.contents[0].content.id, 'for editable:', editable);
    return section.contents[0].content.id;
  };

  const getCurrentContentData = (sectionName: string): Record<string, any> => {
    if (!data) return {};

    const section = data.page.sections.find(s => s.name === `${sectionName}-home`);
    if (!section || !section.contents[0]) return {};

    return section.contents[0].content.data;
  };

  const getFieldName = (editableId: string): string => {
    // "hero_title" -> "title"
    const parts = editableId.split('_');
    return parts[parts.length - 1];
  };


const handleSaveCollection = async <T extends CollectionItem>(
  collectionData: EditableCollectionData<T>
) => {
  if (!getToken) {
    console.error('No token available');
    return;
  }

  try {
    console.log('Saving collection:', collectionData);

    // ACTUALIZAR CADA ITEM INDIVIDUALMENTE
    const promises = collectionData.items.map((item, index) => {
      const contentId = (item as any).contentId;
      
      if (!contentId) {
        console.error('Item missing contentId:', item);
        return Promise.resolve();
      }

      // Preparar los datos - remover campos internos
      const { contentId: _, id, ...itemData } = item as any;
      
      const dataToSave = {
        ...itemData,
        order: index  // Actualizar el orden
      };

      console.log(`Updating content ${contentId} with:`, dataToSave);

      return cmsService.updateContent(
        contentId,
        { 
          data: dataToSave,
          status: 'published' 
        },
        getToken()
      );
    });

    await Promise.all(promises);
    console.log('All items updated successfully');
    
    loadData();
    
  } catch (error) {
    console.error('Error saving collection:', error);
    throw error;
  }
};

  /**
   * Mapea el ID de la colección al nombre del campo en la API
   * Ajusta estos nombres según la estructura de tu backend
   */
  const getCollectionFieldName = (collectionId: string): string => {
    const fieldMap: Record<string, string> = {
      // ClientsSection
      'clients_logos': 'logos',  // o el nombre que uses en tu API
      
      // ProductsSection
      'products-kapital': 'items',  // ajusta según tu API
      'products-valora': 'items',   // ajusta según tu API
      
      // Agrega más mapeos según necesites
      'platform_cards': 'cards',
      'team_members': 'members',
    };
    
    // Si no hay mapeo, intentar extraer el último segmento
    // "clients_logos" -> "logos"
    if (fieldMap[collectionId]) {
      return fieldMap[collectionId];
    }
    
    const parts = collectionId.split('_');
    return parts[parts.length - 1];
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Error</div>;

  //MENU
  const headerMenu = data.menus?.header_landing?.items ?? [];
  const menuItems: MenuItem[] = headerMenu.map(item => ({
    id: item.id,
    name: item.title,
    slug: item.slug ?? item.title.toLowerCase().replace(/\s+/g, '-'),
    visible: item.is_visible,
    target: item.target ?? '_self',
    order: item.order ?? 0
  }));

  //HERO
  const heroSection = data.page.sections.find(section => section.name === "hero-home");
  const heroData = heroSection?.contents[0]?.content.data;
  
  //PLATFORM
  const platformSection = data.page.sections.find(section => section.name === "platform");
  const platformData = platformSection?.contents.map(content => content.content.data);

  //CTA
  const ctaSection = data.page.sections.find(section => section.name === "cta-home");
  const ctaData = ctaSection?.contents[0]?.content.data;

  //Client
  const clientsSection = data.page.sections.find(section => section.name === "clients-home");
  const contents = clientsSection?.contents ?? [];

  const clientTitle = contents.find(item => item.content.slug === "clients-title")?.content.data.text
 
  const clientsLogos = contents.filter(item => item.content.slug === "clients-logos").map(item => item.content.data);

  //Benefits
  const benefitsSection = data.page.sections.find(section => section.name === "benefits-home");
  const benefitsData = benefitsSection?.contents[0]?.content.data;

  //Products
  const productsKapitalSection = data.page.sections.find(section => section.name === "products-kapital");
  const productsKapitalData = productsKapitalSection?.contents.map(content => ({
  ...content.content.data,
  id: content.content.slug,           // ID para React key
  contentId: content.content.id,      // ← ID del content en la API
  order: content.order
}));

  const productsValoraSection = data.page.sections.find(section => section.name === "products-valora");
  const productsValoraData = productsValoraSection?.contents.map(content => ({
  ...content.content.data,
  id: content.content.slug,           // ID para React key
  contentId: content.content.id,      // ← ID del content en la API
  order: content.order
}));

  const productsData = {
    kapital: {
      id: 'products-kapital',
      section: 'products-kapital',
      items: productsKapitalData || [],
    },
    valora: {
      id: 'products-valora',
      section: 'products-valora',
      items: productsValoraData || [],
    },
  };

  //Team
  const teamSection = data.page.sections.find(section => section.name === "team-home");
  const teamData = teamSection?.contents[0]?.content.data;

  //Contact
  const contactSection = data.page.sections.find(section => section.name === "contact-home");
  const contactData = contactSection?.contents[0]?.content.data;




  return (
    <div className="landing-page">
      <LandingHeader 
        company={COMPANY}
        menuItems={menuItems}
        user={user}
        onLogout={onLogout}
        onLogin={onLogin}
        onRegister={onRegister}
      />

      <div style={{ minHeight: '100vh' }}>
        <HeroSection
          content={heroData}
          onSave={handleSaveContent}
        />

        <PlatformCardsSection cards={platformData} />

        <CTASection
          content={ctaData}
          isAdmin={isAdmin}
          onSave={handleSaveContent}
        />

        <ClientsSection
          content={clientTitle}
          clients={clientsLogos}
          onSave={handleSaveContent}
        />
      </div>

      <BenefitsSection content={benefitsData} isAdmin={isAdmin} onSave={handleSaveContent} />
      <ProductsSection content={productsData}  onSave={handleSaveContent} onSaveCollection={handleSaveCollection} />
      <TeamSection
      title={teamData.title}
      authors={teamData.authors}
      developmentTeam={teamData.developmentTeam}
      collaborators={teamData.collaborators}
      onSave={handleSaveContent}
    />

      <ContactSection content={contactData} onSave={handleSaveContent} />

      <ScrollTop />
    </div>
  );
}