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