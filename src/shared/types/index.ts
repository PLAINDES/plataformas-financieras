import type { PageResponse, SectionResponse } from "./api.types";

export type {
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
} from "./api.types";

export * from "./templatecomplement.types";

// Re-export User types from auth module - unica fuente de la verdad
export type {
  User,
  RegisterData,
  LoginCredentials,
  AuthResponse,
  UserResponse,
  TokenResponse,
  UserCreate,
  UserUpdate,
} from "@/features/auth/types/user.types";

export interface Company {
  id: number;
  name: string;
  host: string;
  email?: string;
  phone?: string;
  address?: string;
  logos: Logo[];
  social_links?: SocialLink[];
  facebook_link?: string;
  twitter_link?: string;
  linkedin_link?: string;
  instagram_link?: string;
  whatsapp_link?: string;
  terms_and_conditions?: string;
  privacy_policies?: string;
  phone_contact?: string;
  email_contact?: string;
}

export interface Logo {
  id: number;
  patch: string;
  type: "default" | "sticky" | "footer" | "dark";
  alt?: string;
}

export interface SocialLink {
  id: number;
  platform: "facebook" | "twitter" | "linkedin" | "instagram" | "youtube";
  url: string;
  icon?: string;
}

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

export interface LandingData {
  page: PageResponse;
  sections: SectionResponse[];
  company: Company;
  menus?: MenuItem[];
}

// Main Module Types
export interface TemplateComplement {
  id: number;
  nombre: string;
  fecha: string;
  data?: any;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export type TemplateComplementCreate = Omit<
  TemplateComplement,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;
export type TemplateComplementUpdate = Partial<TemplateComplementCreate>;

export interface Calculation {
  code: string;
  id: number;
  calculation_file_id: string | null;
  user_id: number;
  type: "valora" | "kapital";
  data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CalculationCreate {
  calculation_file_id?: string | null;
  user_id: number | null;
  code: string;
  type: "valora" | "kapital";
  data?: Record<string, unknown> | null;
}

export type CalculationUpdate = Partial<CalculationCreate>;

export interface MediaBasic {
  id: number;
  url: string;
  filename: string;
  original_name: string;
  mime_type: string;
  alt_text: string | null;
}

export interface CoverDetail {
  id: number;
  nombre: string;
  tipo: "imagen_adjuntada" | "personalizada";
  portada: MediaBasic | null;
  primer_imagen_footer: MediaBasic | null;
  segundo_imagen_footer: MediaBasic | null;
  logo_superior: MediaBasic | null;
  imagen_central: MediaBasic | null;
  logo_inferior: MediaBasic | null;
  imagen_fondo: MediaBasic | null;
}

export interface TemplateCodeBasic {
  id: number;
  nombre: string;
  code: string;
  type: "valora" | "kapital";
  hoja: string | null;
}

export interface TemplateWithCodes {
  id: number;
  nombre: string;
  is_default: boolean;
  template_codes: TemplateCodeBasic[];
}

export interface Report {
  id: number;
  nombre: string;
  type?: "valora" | "kapital" | null;
  file: string | null;
  precio: number | null;
  moneda: string;
  sector_empresa: string | null;
  bono_ajustado: string | null;
  link_pago: string | null;
  contenido: string | null;
  contentEditor?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  template: TemplateWithCodes | null;
  portada: CoverDetail | null;
}

export type CoverTipo = "imagen_adjuntada" | "personalizada";

export interface Cover {
  id: number;
  nombre: string;
  tipo: CoverTipo;
  portada: MediaBasic | null;
  primer_imagen_footer: MediaBasic | null;
  segundo_imagen_footer: MediaBasic | null;
  logo_superior: MediaBasic | null;
  imagen_central: MediaBasic | null;
  logo_inferior: MediaBasic | null;
  imagen_fondo: MediaBasic | null;
}

export interface CoverUpdate {
  portada_id?: number | null;
  primer_imagen_footer_id?: number | null;
  segundo_imagen_footer_id?: number | null;
  logo_superior_id?: number | null;
  imagen_central_id?: number | null;
  logo_inferior_id?: number | null;
  imagen_fondo_id?: number | null;
}

export interface ReportUpdate {
  nombre?: string;
  precio?: number | null;
  moneda?: string;
  sector_empresa?: string | null;
  bono_ajustado?: string | null;
  link_pago?: string | null;
  contenido?: string | null;
  activo?: boolean;
  cover_data?: CoverUpdate;
  type?: "valora" | "kapital";
  portada_id?: number | null;
  contentEditor?: string | null;
}
