// src/services/auth.service.ts

import { api } from './api';
import type { 
  UserResponse,
  TokenResponse,
  UserLogin,
  UserCreate
} from '../types/api.types';

export class AuthService {
  private readonly basePath = 'auth';

  /**
   * Registra un nuevo usuario
   */
  async register(data: UserCreate): Promise<TokenResponse> {
    return api.post<TokenResponse>(`${this.basePath}/register`, data);
  }

  /**
   * Inicia sesión
   */
  async login(credentials: UserLogin): Promise<TokenResponse> {
    return api.post<TokenResponse>(`${this.basePath}/login`, credentials);
  }

  /**
   * Cierra sesión
   */
  async logout(token: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(
      `${this.basePath}/logout`, 
      {},
      { token }
    );
  }

  /**
   * Obtiene información del usuario actual
   */
  async getCurrentUser(token: string): Promise<UserResponse> {
    return api.get<UserResponse>(`${this.basePath}/me`, { token });
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(token: string): Promise<TokenResponse> {
    return api.post<TokenResponse>(
      `${this.basePath}/refresh`, 
      {},
      { token }
    );
  }
}

export const authService = new AuthService();