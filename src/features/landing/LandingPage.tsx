// src/app/landing/LandingPage.tsx
import { HeroSection } from './sections/HeroSection';
import { PlatformCardsSection } from './sections/PlatformCardsSection';
import { ClientsSection } from './sections/ClientsSection';
import { BenefitsSection } from './sections/BenefitsSection';
import { ProductsSection } from './sections/ProductsSection';
import { ContactSection } from './sections/ContactSection';
import { CTASection } from './sections/CTASection';
import TeamSection from './sections/TeamSection';
import { LandingHeader } from './layout/LandingHeader';
import { ScrollTop } from '@/shared/components/layout/ScrollTop';
import { useLandingData } from '@/features/landing/hooks/useLandingData';
import { useLandingCMS } from '@/features/landing/hooks/useLandingCMS';
import type { Company } from '@/shared/types';
import type { User } from '@/shared/types/user.types';
import type { LoginCredentials } from '../auth/types/user.types';

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
  isAdmin, 
  user, 
  onLogout, 
  onLogin, 
  onRegister 
}: LandingPageProps) {
  
  const { 
    data, 
    loading, 
    menuItems, 
    refresh, 
    findContent, 
    getContentData,
    updateContentLocally
  } = useLandingData();

  const { handleSaveContent, handleSaveCollection } = useLandingCMS(data, updateContentLocally, findContent);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!data) return <div className="flex h-screen items-center justify-center text-red-500">Error loading data</div>;

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
          content={getContentData("hero-home")}
          onSave={handleSaveContent}
        />

        <PlatformCardsSection 
          content={getContentData("platforms")} 
          onSave={handleSaveContent}
          onSaveCollection={handleSaveCollection}
        />

        <CTASection
          content={getContentData("cta-home")}
          isAdmin={isAdmin}
          onSave={handleSaveContent}
        />

        <ClientsSection
          content={getContentData("clients")}
          onSave={handleSaveContent}
          onSaveCollection={handleSaveCollection}
        />
      </div>

      <BenefitsSection 
        content={getContentData("benefits-home")} 
        isAdmin={isAdmin} 
        onSave={handleSaveContent} 
      />
      
      <ProductsSection 
        content={getContentData("products")} 
        onSave={handleSaveContent} 
        onSaveCollection={handleSaveCollection} 
      />
      
      <TeamSection
        content={getContentData("team")}
        onSave={handleSaveContent}
        onSaveCollection={handleSaveCollection}
      />

      <ContactSection 
        content={getContentData("contact-home")} 
        onSave={handleSaveContent} 
      />

      <ScrollTop />
    </div>
  );
}