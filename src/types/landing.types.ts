// src/types/landing.types.ts

import type { EditableContent } from './editable.types';
import type { LinkData, VideoData, EditableCollectionData } from './editable-collection.types';
import type { SectionResponse } from './api.types';
// ============================================
// HERO SECTION
// ============================================
export interface MenuItemResponse {
  id: number;
  menu_id: number;
  parent_id: number | null;
  title: string;
  url: string | null;
  page_id: number | null;
  target: '_self' | '_blank';
  icon: string | null;
  order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuWithItems {
  id: number;
  name: string;
  label: string;
  created_at: string;
  updated_at: string;
  items: MenuItemResponse[];
}


// src/types/landing.api.types.ts
export interface LandingDataResponse {
  page: {
    id: number;
    title: string;
    slug: string;
    template: string;
    is_homepage: boolean;
    settings: {
      layout: string;
      show_footer: boolean;
      show_header: boolean;
    };
    seo_title: string;
    seo_description: string;
    seo_image: string | null;
    sections: SectionResponse[]; // Lista de secciones
    created_at: string;
    updated_at: string;
  };
  menus: Record<string, any>;
  site: {
    site_key: string;
    name: string;
    branding: {
      logo_url: string | null;
      logo_alt: string | null;
      favicon_url: string | null;
    };
    theme: {
      primary_color: string;
      theme: string;
    };
  } | null;
  meta: any;
}


export interface HeroSectionData {
  title: EditableContent;
  subtitle?: EditableContent;
  description?: EditableContent;
  ctaButton: LinkData;
  backgroundImage: EditableContent;
}

// Legacy type (mantener por compatibilidad)
export interface HeroContent {
  title: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
}

// ============================================
// PLATFORM SECTION
// ============================================

export interface PlatformSectionData {
  title: EditableContent;
  subtitle: EditableContent;
  cards: EditableCollectionData<PlatformCardItem>;
}

export interface PlatformCardItem {
  id: string;
  order: number;
  title: string;
  caption: string;
  description?: string;
  imageUrl: string;
  video: VideoData;
  hoverVideo?: VideoData;
  ctaLink?: LinkData;
  libraryLink?: LinkData;
  ribbon?: string;
}

// Legacy type
export interface PlatformCard {
  id: string;
  title: string;
  description: string;
  caption: string;
  imageUrl: string;
  videoUrl: string;
  disabled?: boolean;
}

// ============================================
// CTA SECTION
// ============================================

export interface CTASectionData {
  title: EditableContent;
  description: EditableContent;
  whatsappButton: LinkData;
  whatsappNumber: string;
}

// Legacy type
export interface CTAContent {
  description: string;
  whatsappNumber: string;
}

// ============================================
// CLIENTS SECTION
// ============================================

export interface ClientsSectionData {
  title: EditableContent;
  logos: EditableCollectionData<ClientLogo>;
}

export interface ClientLogo {
  id: string;
  order?: number;
  name: string;
  imageUrl: string;
  alt: string;
  websiteUrl?: string;
}

// ============================================
// BENEFITS SECTION
// ============================================

export interface BenefitsSectionData {
  title: EditableContent;
  subtitle: EditableContent;
  items: EditableCollectionData<BenefitItem>;
}

export interface BenefitItem {
  id: string;
  order: number;
  icon: string;
  title: string;
  description: string;
  imageUrl?: string;
}

// Legacy type
export interface BenefitsContent {
  title: string;
  subtitle: string;
}

// ============================================
// PRODUCTS SECTION
// ============================================

export interface ProductsSectionData {
  title: EditableContent;
  tabs: {
    kapital: EditableCollectionData<ProductItem>;
    valora: EditableCollectionData<ProductItem>;
  };
}

export interface ProductItem {
  id: string;
  order: number;
  name: string;
  caption: string;
  price: number;
  typeName: string;
  imageUrl?: string;
  ribbon?: string;
  ctaLink?: LinkData;
  features?: string[];
}

// ============================================
// TEAM SECTION
// ============================================

export interface TeamSectionData {
  title: EditableContent;
  subtitle?: EditableContent;
  members: EditableCollectionData<TeamMember>;
}

export interface TeamMember {
  id: string;
  order: number;
  name: string;
  role: string;
  bio?: string;
  imageUrl: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

// ============================================
// CONTACT SECTION
// ============================================

export interface ContactSectionData {
  title: EditableContent;
  subtitle?: EditableContent;
  email: EditableContent;
  phone: EditableContent;
  address?: EditableContent;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

// ============================================
// HELPER TYPES
// ============================================

export interface SectionMeta {
  id: string;
  section: string;
  enabled: boolean;
  order: number;
}

// ============================================
// FULL LANDING PAGE DATA
// ============================================

export interface LandingPageData {
  hero: HeroSectionData;
  platform: PlatformSectionData;
  cta: CTASectionData;
  clients: ClientsSectionData;
  benefits: BenefitsSectionData;
  products: ProductsSectionData;
  team?: TeamSectionData;
  contact?: ContactSectionData;
  meta?: {
    lastUpdated: string;
    version: string;
  };
}