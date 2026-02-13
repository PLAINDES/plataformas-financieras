// src/shared/types/user.ts

export interface User {
  id: number;
  email: string;
  name: string;
  lastname: string | null;
  role: 'admin' | 'user';
  perfil: 1 | 2 | 3; // Mantenerlo si lo usas para lógica de permisos
  avatar: string | null;
  is_active: boolean;
}

// Opcional: Si el enum de roles se usa en Layouts para mostrar/ocultar secciones
export const UserRole = {
  ADMIN: 1,
  EDITOR: 2,
  USER: 3,
} as const;
