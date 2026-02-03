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

  // Helper para buscar content por slug
  const findContentBySlug = (slug: string) => {
    return data?.page.contents.find(c => c.slug === slug);
  };

  // Handler genérico para guardar contenido
  const handleSaveContent = async (editableContent: EditableContent) => {
    if (!getToken) {
      console.error('No token available');
      return;
    }

    try {
      const contentId = getContentIdFromEditable(editableContent);
      
      if (!contentId) {
        console.error('Content ID not found for:', editableContent);
        return;
      }

      const currentContent = getCurrentContentData(editableContent.section);
      const fieldName = getFieldName(editableContent.id);
      
      // El valor puede ser un string, number, object, etc.
      const updatedData = {
        ...currentContent,
        [fieldName]: editableContent.value,
      };
      
      console.log('Updating content ID', contentId, 'field', fieldName, 'with data:', updatedData);
      
      await cmsService.updateContent(
        contentId,
        { data: updatedData, status: 'published' },
        getToken()
      );

      loadData();
      
    } catch (error) {
      console.error('Error saving content:', error);
      throw error;
    }
  };

  const getContentIdFromEditable = (editable: EditableContent): number | null => {
    if (!data) return null;
    console.log('Getting content ID for editable:', editable);
    
    const content = findContentBySlug(`${editable.section}-home`) || findContentBySlug(editable.section);
    console.log('Found content:', content);
    
    if (!content) return null;
    
    console.log('Found content ID:', content.id, 'for editable:', editable);
    return content.id;
  };

  const getCurrentContentData = (sectionName: string): Record<string, any> => {
    if (!data) return {};

    const content = findContentBySlug(`${sectionName}-home`) || findContentBySlug(sectionName);
    if (!content) return {};

    return content.data;
  };

  const getFieldName = (editableId: string): string => {
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

      switch (collectionData.section) {
        case 'products': {
          // Estructura anidada: categories > products
          const productsContent = findContentBySlug("products");
          if (!productsContent) {
            console.error('Products content not found');
            return;
          }

          const currentData = productsContent.data;
          const categoryId = collectionData.id === 'products-kapital' ? 'cat-kapital' : 'cat-valora';
          
          // Actualizar la categoría específica
          const updatedCategories = currentData.categories.map((cat: any) => {
            if (cat.id === categoryId) {
              return {
                ...cat,
                products: collectionData.items.map((item) => {
                  const { contentId, order, ...productData } = item as any;
                  return productData;
                })
              };
            }
            return cat;
          });

          await cmsService.updateContent(
            productsContent.id,
            { 
              data: {
                ...currentData,
                categories: updatedCategories
              },
              status: 'published' 
            },
            getToken()
          );

          console.log('Products updated successfully');
          break;
        }

        case 'platforms': {
          // Array simple: items
          const platformsContent = findContentBySlug("platforms");
          if (!platformsContent) {
            console.error('Platforms content not found');
            return;
          }

          const currentData = platformsContent.data;
          
          const updatedData = {
            ...currentData,
            items: collectionData.items.map((item) => {
              const { contentId, order, title, ...itemData } = item as any;
              // Mantener 'name' en lugar de 'title'
              return itemData;
            })
          };

          await cmsService.updateContent(
            platformsContent.id,
            { 
              data: updatedData,
              status: 'published' 
            },
            getToken()
          );

          console.log('Platforms updated successfully');
          break;
        }

        case 'clients': {
          // Array simple: logos
          const clientsContent = findContentBySlug("clients");
          if (!clientsContent) {
            console.error('Clients content not found');
            return;
          }

          const currentData = clientsContent.data;
          
          const updatedData = {
            ...currentData,
            logos: collectionData.items.map((item) => {
              const { contentId, order, ...logoData } = item as any;
              return logoData;
            })
          };

          await cmsService.updateContent(
            clientsContent.id,
            { 
              data: updatedData,
              status: 'published' 
            },
            getToken()
          );

          console.log('Clients updated successfully');
          break;
        }

        case 'team': {
          // Manejar las tres colecciones del team
          const teamContent = findContentBySlug("team");
          if (!teamContent) {
            console.error('Team content not found');
            return;
          }

          const currentData = teamContent.data;
          
          // Determinar qué campo actualizar basado en el ID
          let fieldName = '';
          if (collectionData.id === 'team-authors') {
            fieldName = 'authors';
          } else if (collectionData.id === 'team-developmentTeam') {
            fieldName = 'developmentTeam';
          } else if (collectionData.id === 'team-collaborators') {
            fieldName = 'collaborators';
          } else {
            console.error('Unknown team collection:', collectionData.id);
            return;
          }

          const updatedData = {
            ...currentData,
            [fieldName]: collectionData.items.map((item) => {
              const { contentId, order, ...memberData } = item as any;
              return memberData;
            })
          };

          await cmsService.updateContent(
            teamContent.id,
            { 
              data: updatedData,
              status: 'published' 
            },
            getToken()
          );

          console.log(`Team ${fieldName} updated successfully`);
          break;
        }

        default: {
          console.error(`Unknown collection section: ${collectionData.section}`);
          return;
        }
      }

      // Recargar datos después de guardar
      loadData();
      
    } catch (error) {
      console.error('Error saving collection:', error);
      throw error;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Error</div>;

  // MENU
  const headerMenu = data.menus?.header_landing?.items ?? [];
  const menuItems: MenuItem[] = headerMenu.map(item => ({
    id: item.id,
    name: item.title,
    slug: item.slug ?? item.title.toLowerCase().replace(/\s+/g, '-'),
    visible: item.is_visible,
    target: item.target ?? '_self',
    order: item.order ?? 0
  }));

  // HERO
  const heroContent = findContentBySlug("hero-home");
  const heroData = heroContent?.data;
  
  // PLATFORMS
  const platformsContent = findContentBySlug("platforms");
  const platformsData = platformsContent?.data;

  // CTA
  const ctaContent = findContentBySlug("cta-home");
  const ctaData = ctaContent?.data;

  // CLIENTS
  const clientsContent = findContentBySlug("clients");
  const clientsData = clientsContent?.data;

  // BENEFITS
  const benefitsContent = findContentBySlug("benefits-home");
  const benefitsData = benefitsContent?.data;

  // PRODUCTS
  const productsContent = findContentBySlug("products");
  const productsData = productsContent?.data;

  // TEAM
  const teamContent = findContentBySlug("team");
  const teamData = teamContent?.data;

  // CONTACT
  const contactContent = findContentBySlug("contact-home");
  const contactData = contactContent?.data;

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

        <PlatformCardsSection 
          content={platformsData} 
          onSave={handleSaveContent}
          onSaveCollection={handleSaveCollection}
        />

        <CTASection
          content={ctaData}
          isAdmin={isAdmin}
          onSave={handleSaveContent}
        />

        <ClientsSection
          content={clientsData}
          onSave={handleSaveContent}
          onSaveCollection={handleSaveCollection}
        />
      </div>

      <BenefitsSection 
        content={benefitsData} 
        isAdmin={isAdmin} 
        onSave={handleSaveContent} 
      />
      
      <ProductsSection 
        content={productsData} 
        onSave={handleSaveContent} 
        onSaveCollection={handleSaveCollection} 
      />
      
      <TeamSection
        content={teamData}
        onSave={handleSaveContent}
        onSaveCollection={handleSaveCollection}
      />

      <ContactSection 
        content={contactData} 
        onSave={handleSaveContent} 
      />

      <ScrollTop />
    </div>
  );
}