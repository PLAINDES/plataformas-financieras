/**
Roles de usuario
*/
export const UserRole = {
  ADMIN: 1,
  USER: 2,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 Usuario frontend
 */
export interface User {
  id: number;
  email: string;
  name: string;
  lastname?: string;
  phone_number?: string | null;
  birth_date?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  ruc?: string | null;
  role: "admin" | "master" | "user";
  is_active: boolean;
  avatar: string | null;
  created_at: string;
  updated_at?: string | null;
  last_activity_at?: string | null;
  // Compatibilidad con modelo legacy: 1=admin, 2=user
  perfil: 1 | 2;
}

/**
 * Sesión de autenticación
 */
export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/**
 * Credenciales para login
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
  phone_number: string;
  email: string;
  birth_date: string;
  document_type: "dni" | "ruc" | "ce";
  document_number: string;
  ruc: string;
  password: string;
  password_confirmation: string;
}

/**
 * Respuesta de autenticación del backend
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ==================== BACKEND RESPONSE TYPES ====================

/**
 * Respuesta del backend para usuario
 */
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  lastname: string | null;
  phone_number: string | null;
  birth_date?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  ruc?: string | null;
  role: "admin" | "master" | "user";
  is_active: boolean;
  avatar: string | null;
  created_at: string;
  updated_at?: string | null;
  last_activity_at?: string | null;
}

/**
 * Respuesta del backend para login/register
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

/**
 * Crear usuario
 */
export interface UserCreate {
  email: string;
  name: string;
  lastname?: string;
  phone_number: string;
  birth_date: string;
  document_type: "dni" | "ruc" | "ce";
  document_number: string;
  ruc?: string;
  password: string;
  password_confirmation: string;
  role?: "admin" | "master" | "user";
}

/**
 * Actualizar usuario
 */
export interface UserUpdate {
  name?: string;
  lastname?: string;
  phone_number?: string | null;
  email?: string;
  avatar?: string;
}

export interface UserAdminUpdate {
  name?: string;
  lastname?: string;
  phone_number?: string | null;
  email?: string;
  birth_date?: string | null;
  document_type?: "dni" | "ruc" | "ce" | null;
  document_number?: string | null;
  ruc?: string | null;
  role?: "admin" | "master" | "user";
  is_active?: boolean;
  password?: string;
}

export interface PaginatedUserResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ==================== MAPPING FUNCTIONS ====================

/**
 * Convierte UserResponse del backend a User del frontend
 */
export function mapUserResponseToUser(userResponse: UserResponse): User {
  return {
    id: userResponse.id,
    email: userResponse.email,
    name: userResponse.name,
    lastname: userResponse.lastname ?? undefined, // Asegurar compatibilidad string | undefined
    phone_number: userResponse.phone_number,
    birth_date: userResponse.birth_date ?? null,
    document_type: userResponse.document_type ?? null,
    document_number: userResponse.document_number ?? null,
    ruc: userResponse.ruc ?? null,
    role: userResponse.role,
    is_active: userResponse.is_active,
    avatar: userResponse.avatar,
    created_at: userResponse.created_at,
    updated_at: userResponse.updated_at ?? null,
    last_activity_at: userResponse.last_activity_at ?? null,
    // Mapear role a perfil numérico de compatibilidad
    perfil:
      userResponse.role === "admin" || userResponse.role === "master" ? 1 : 2,
  };
}

/**
 * Convierte TokenResponse a AuthResponse
 */
export function mapTokenResponseToAuth(
  tokenResponse: TokenResponse
): AuthResponse {
  return {
    access_token: tokenResponse.access_token,
    token_type: tokenResponse.token_type,
    user: mapUserResponseToUser(tokenResponse.user),
  };
}

/**
 * Verifica si un usuario es administrador
 */
export function isUserAdmin(user: User | null): boolean {
  return (
    user?.role === "admin" || user?.role === "master" || user?.perfil === 1
  );
}
