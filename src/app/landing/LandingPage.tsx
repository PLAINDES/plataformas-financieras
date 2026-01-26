// src/app/landing/LandingPage.tsx

import { HeroSection } from './sections/HeroSection';
import { PlatformCardsSection } from './sections/PlatformCardsSection';
import { ClientsSection } from './sections/ClientsSection';
import { BenefitsSection } from './sections/BenefitsSection';
import { ProductsSection } from './sections/ProductsSection';
import { ContactSection }  from './sections/ContactSection';
import  TeamSection  from './sections/TeamSection';
import type { HeroContent, PlatformCard, ClientLogo } from '../../types/landing.types';
import { CTASection } from './sections/CTASection';
import type { CTAContent } from '../../types/landing.types';

interface LandingPageProps {
  isAdmin: boolean;
}

export function LandingPage({ isAdmin }: LandingPageProps) {
  return (
    <div className="landing-page">
      <div style={{ minHeight: '100vh' }}>
        <HeroSection
          content={heroMock}
          isAdmin={isAdmin}
          onSave={async (content) => {
            console.log('Saving hero content', content);
          }}
        />

        <PlatformCardsSection
          cards={platformCardsMock}
        />
                  <CTASection
          content={ctaMock}
          isAdmin={isAdmin}
          onSave={async (content) => {
            console.log('Saving CTA', content);
          }}
        />

        <ClientsSection
          clients={clientsMock}
        />

  
      </div>
  
      <BenefitsSection content={benefitsMock} isAdmin={isAdmin} />
      <ProductsSection isAdmin={isAdmin} />
      <TeamSection />
      <ContactSection />
    </div>
  );
}





export const heroMock: HeroContent = {
  title: 'Análisis Financiero',
  description: '',
  ctaText: '',
  ctaUrl: '',
};

export const platformCardsMock: PlatformCard[] = [
  {
    id: '1',
    title: 'Capital',
    description: 'Sectorial / De la empresa',
    caption: 'Calcula tu costo de capital',
    imageUrl: '/images/logo-kapital.png',
    videoUrl: 'http://localhost:5173/video/Modulo%20Kapital%20-%20Kapitals.mp4',
    disabled: false,
  },
  {
    id: '2',
    title: 'Valora',
    description: 'Método FDC descontado / Sensibilidad del Valor',
    caption: 'Valorización de empresas',
    imageUrl: '/images/logo-valora.png',
    videoUrl: 'http://localhost:5173/video/Modulo%20Valora%20-%20Valora.mp4',
    disabled: false,
  },
];

export const clientsMock: ClientLogo[] = [
  {
    id: '1',
    name: 'Google',
    imageUrl: '/images/google-item.png',
    alt: 'Google logo',
  },
  {
    id: '2',
    name: 'Microsoft',
    imageUrl: '/images/microsoft-item.png',
    alt: 'Microsoft logo',
  },
  {
    id: '2',
    name: 'Revolut',
    imageUrl: '/images/revolut-item.png',
    alt: 'Revolut logo',
  },
  {
    id: '2',
    name: 'Uber',
    imageUrl: '/images/uber-item.png',
    alt: 'Uber logo',
  },
];

export const ctaMock: CTAContent = {
  description: 'Únete a la comunidad.',
  whatsappNumber: '51987654321',
};

export const benefitsMock: BenefitsContent = {
  // Add your benefits content properties here
};
