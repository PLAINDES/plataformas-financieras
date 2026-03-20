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
  role: "admin" | "master" | "user";
  is_active: boolean;
  avatar: string | null;
  created_at: string;
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
  email: string;
  password: string;
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
  role: "admin" | "master" | "user";
  is_active: boolean;
  avatar: string | null;
  created_at: string;
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
  password: string;
  role?: "admin" | "master" | "user";
}

/**
 * Actualizar usuario
 */
export interface UserUpdate {
  name?: string;
  lastname?: string;
  email?: string;
  avatar?: string;
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
    role: userResponse.role,
    is_active: userResponse.is_active,
    avatar: userResponse.avatar,
    created_at: userResponse.created_at,
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
