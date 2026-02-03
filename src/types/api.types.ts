// src/types/api.types.ts
// Tipos que coinciden EXACTAMENTE con los schemas de FastAPI

// ==================== AUTH ====================

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  lastname: string | null;
  role: 'admin' | 'user';
  is_active: boolean;
  avatar: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserCreate {
  email: string;
  name: string;
  lastname?: string;
  password: string;
  role?: 'admin' | 'user';
}

// ==================== CMS - LANDING ====================

// types/api.types.ts

// Interface para los items del contenido (data variable)
export interface SectionContentItem {
  id: number;
  order: number;
  is_visible: boolean;
  content: {
    id: number;
    slug: string;
    status: string;
    content_type_id: number;
    data: any; // Aquí puedes ser más específico según la sección (Hero, Product, etc.)
    created_at: string;
    updated_at: string;
  };
}

// Interface de la Sección corregida
export interface SectionResponse {
  id: number;
  name: string;          // "hero-home", "platform", etc.
  component: string;     // "HeroSection", "PlatformSection", etc.
  order: number;
  is_visible: boolean;
  page_id: number;
  contents: SectionContentItem[]; // Es una lista de contenidos
  created_at: string;
  updated_at: string;
}



export interface PageResponse {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  status: 'draft' | 'published';
  is_homepage: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageWithSections extends PageResponse {
  sections: SectionResponse[];
}

export interface LandingDataResponse {
  page: PageResponse;
  sections: SectionResponse[];
  company_info: Record<string, any>; // JSON dinámico del backend
}

// ==================== CMS - PAGES (ADMIN) ====================

export interface PageCreate {
  title: string;
  slug: string;
  description?: string;
  status?: 'draft' | 'published';
  is_homepage?: boolean;
  meta_title?: string;
  meta_description?: string;
}

export interface PageUpdate {
  title?: string;
  slug?: string;
  description?: string;
  status?: 'draft' | 'published';
  is_homepage?: boolean;
  meta_title?: string;
  meta_description?: string;
}

// ==================== CMS - SECTIONS (ADMIN) ====================

export interface SectionCreate {
  page_id: number;
  section_type: string;
  title?: string;
  subtitle?: string;
  content?: Record<string, any>;
  position: number;
  is_active?: boolean;
  css_classes?: string;
}

export interface SectionUpdate {
  section_type?: string;
  title?: string;
  subtitle?: string;
  content?: Record<string, any>;
  position?: number;
  is_active?: boolean;
  css_classes?: string;
}

// ==================== CMS - CONTACT ====================

export interface ContactMessageCreate {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactMessageUpdate {
  status: 'unread' | 'read' | 'replied';
  admin_notes?: string;
}

export interface ContactMessageResponse {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  ip_address: string | null;
  user_agent: string | null;
  admin_notes: string | null;
  replied_by_id: number | null;
  replied_at: string | null;
  created_at: string;
}

// ==================== CMS - MEDIA ====================

export interface MediaCreate {
  filename: string;
  path: string;
  mime_type: string;
  size: number;
  folder?: string;
  alt_text?: string;
  title?: string;
}

export interface MediaResponse {
  id: number;
  filename: string;
  path: string;
  url: string;
  mime_type: string;
  size: number;
  folder: string | null;
  alt_text: string | null;
  title: string | null;
  uploaded_by_id: number | null;
  created_at: string;
}

// ==================== CMS - DASHBOARD ====================

export interface AdminDashboardStats {
  total_pages: number;
  published_pages: number;
  draft_pages: number;
  total_sections: number;
  unread_messages: number;
  total_messages: number;
  total_media: number;
}

// ==================== API ERROR ====================

export interface APIError {
  detail: string;
}