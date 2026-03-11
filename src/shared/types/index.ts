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
  code: ReactNode;
  id: number;
  calculation_file_id: number | null;
  user_id: number;
  report_code: string;
  type: "valora" | "kapital";
  data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}
