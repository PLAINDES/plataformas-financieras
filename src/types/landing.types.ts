// src/types/landing.types.ts

export interface CTAContent {
  description: string;
  whatsappNumber?: string;
}

/**
 * Sección CMS real (backend-driven)
 */
export interface CMSSection {
  id: number;
  type: 'hero' | 'platform_cards' | 'cta' | 'clients' | string;
  order: number;
  content: Record<string, any>;
}

/**
 * Respuesta real del endpoint /cms/landing
 */
export interface LandingDataResponse {
  pageId: number;
  slug: string;
  sections: CMSSection[];
  menus?: MenuItem[];
  company?: Company;
  lastUpdated?: string;
}


export interface PlatformCard {
  id: string;
  title: string;
  description: string;
  caption: string;
  imageUrl: string;
  videoUrl: string; // YouTube video ID
  ctaUrl?: string;
  disabled?: boolean;
  ribbon?: string;
}

export interface ClientLogo {
  id: string;
  name: string;
  imageUrl: string;
  alt: string;
}

export interface HeroContent {
  title: string;
  subtitle?: string;
  description: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface LandingSectionData {
  hero: HeroContent;
  platformCards: PlatformCard[];
  clients: ClientLogo[];
  whatsappNumber?: string;
}

export interface LandingSection {
  id: string;
  type: 'hero' | 'platform_cards' | 'clients';
  content: any;
}



export interface BenefitsContent {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
}

export interface IndustryData {
  industry: string;
  value: number;
  label: 'Alto' | 'Medio' | 'Bajo';
  year?: number;
}

export interface YearOption {
  year: number;
}

export interface IndustryAPIResponse {
  industries: string[];
  years: YearOption[];
  data: IndustryData[];
}

// Si necesitas tipos para el acordeón (comentado en el original)
export interface AccordionItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  icon?: string;
}

export interface AccordionSection {
  title: string;
  icon: string;
  items: AccordionItem[];
}


import type { MenuItem, Company } from './index';