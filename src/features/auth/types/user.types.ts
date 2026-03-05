// src/types/user.types.ts

export const UserRole = {
  USER: 1,
  ADMIN: 2,
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  perfil: UserRole;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

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