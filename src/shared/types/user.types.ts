// src/shared/types/user.ts

export interface User {
  id: number;
  email: string;
  name: string;
  lastname?: string;
  role: "admin" | "user";
  perfil: 1 | 2 | 3;
  avatar: string | null;
  is_active: boolean;
}

export const UserRole = {
  ADMIN: 1,
  EDITOR: 2,
  USER: 3,
} as const;
