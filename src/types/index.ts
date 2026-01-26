// src/types/index.ts

import type { PageResponse, SectionResponse, TokenResponse, UserResponse } from './api.types';

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
export interface User {
  id: number;
  email: string;
  name: string;
  lastname: string | null;
  role: 'admin' | 'user';
  is_active: boolean;
  avatar: string | null;
  created_at: string;
  
  // Campo adicional para compatibilidad con código legacy
  // perfil: 1 = admin, 2 = editor, 3 = user
  perfil: 1 | 2 | 3;
}

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Datos para registro
 */
export interface RegisterData {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

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

// ==================== UTILIDADES ====================

/**
 * Convierte UserResponse del backend a User del frontend
 */
export function mapUserResponseToUser(userResponse: UserResponse): User {
  return {
    ...userResponse,
    // Mapear role a perfil numérico
    perfil: userResponse.role === 'admin' ? 1 : 3,
  };
}

/**
 * Convierte TokenResponse del backend a AuthResponse del frontend
 */
export function mapTokenResponseToAuth(tokenResponse: TokenResponse): AuthResponse {
  return {
    access_token: tokenResponse.access_token,
    token_type: tokenResponse.token_type,
    user: mapUserResponseToUser(tokenResponse.user),
  };
}