
import type { PageResponse, SectionResponse } from './api.types';

// ==================== RE-EXPORTS de API ====================
// Importamos los tipos de la API y los re-exportamos
export type {
  UserResponse,
  TokenResponse,
  UserLogin,
  UserCreate,
  LandingDataResponse,
  PageResponse,
  PageWithSections,
  SectionResponse,
  SectionCreate,
  SectionUpdate,
  ContactMessageCreate,
  ContactMessageResponse,
  MediaResponse,
  AdminDashboardStats,
} from './api.types';

// ==================== TIPOS LOCALES (Frontend) ====================

/**
 * User unificado para el frontend
 * Mapea UserResponse del backend + campos adicionales locales
 */

/**
 * Información de la compañía
 */
export interface Company {
  id: number;
  name: string;
  host: string;
  email?: string;
  phone?: string;
  address?: string;
  logos: Logo[];
  social_links?: SocialLink[];
}
const COMPANY = {
  id: 1,
  name: 'Plataforma Finanzas',
  host: 'https://kapitals.org',
  logos: [
    { id: 1, patch: '/images/logo.png', type: 'default' },
    { id: 2, patch: '/images/diseñador.png', type: 'sticky' },
  ],
};


export interface Logo {
  id: number;
  patch: string;
  type: 'default' | 'sticky' | 'footer' | 'dark';
  alt?: string;
}

export interface SocialLink {
  id: number;
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube';
  url: string;
  icon?: string;
}

/**
 * Item de menú
 */
export interface MenuItem {
  id: number;
  name: string;
  slug: string;
  url?: string;
  order: number;
  visible: boolean;
  parent_id?: number;
  children?: MenuItem[];
}

/**
 * Datos completos del landing (extendido)
 */
export interface LandingData {
  page: PageResponse;
  sections: SectionResponse[];
  company: Company;
  menus?: MenuItem[];
}

