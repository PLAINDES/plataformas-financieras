// src/hooks/useAuth.ts

import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import type { 
  User, 
  LoginCredentials, 
  RegisterData,
  UserResponse 
} from '../types';
import { mapUserResponseToUser, mapTokenResponseToAuth } from '../types';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin' || user?.perfil === 1;

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_DATA_KEY);

        if (token && storedUser) {
          // Intentar usar datos del localStorage primero
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);

          // Validar token con el backend
          try {
            const userResponse = await authService.getCurrentUser(token);
            const validatedUser = mapUserResponseToUser(userResponse);
            setUser(validatedUser);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(validatedUser));
          } catch (err) {
            // Token inválido, limpiar
            console.warn('Token inválido, cerrando sesión');
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(USER_DATA_KEY);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Error al cargar sesión');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Iniciar sesión
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    try {
      setError(null);
      
      const tokenResponse = await authService.login(credentials);
      const authResponse = mapTokenResponseToAuth(tokenResponse);
      
      // Guardar token y usuario
      localStorage.setItem(AUTH_TOKEN_KEY, authResponse.access_token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(authResponse.user));
      
      setUser(authResponse.user);
      return authResponse.user;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Registrar nuevo usuario
   */
  const register = useCallback(async (data: RegisterData): Promise<User> => {
    try {
      setError(null);
      
      const tokenResponse = await authService.register(data);
      const authResponse = mapTokenResponseToAuth(tokenResponse);
      
      // Guardar token y usuario
      localStorage.setItem(AUTH_TOKEN_KEY, authResponse.access_token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(authResponse.user));
      
      setUser(authResponse.user);
      return authResponse.user;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al registrar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Cerrar sesión
   */
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      
      if (token) {
        // Intentar cerrar sesión en el backend
        try {
          await authService.logout(token);
        } catch (err) {
          console.warn('Error al cerrar sesión en el backend:', err);
          // Continuar de todos modos con el logout local
        }
      }
      
      // Limpiar estado local
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      setUser(null);
      setError(null);
    } catch (err: any) {
      console.error('Error during logout:', err);
      // Limpiar de todos modos
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      setUser(null);
    }
  }, []);

  /**
   * Refrescar token
   */
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      
      if (!token) {
        throw new Error('No hay token para refrescar');
      }
      
      const tokenResponse = await authService.refreshToken(token);
      const authResponse = mapTokenResponseToAuth(tokenResponse);
      
      localStorage.setItem(AUTH_TOKEN_KEY, authResponse.access_token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(authResponse.user));
      
      setUser(authResponse.user);
    } catch (err: any) {
      console.error('Error refreshing token:', err);
      // Si falla el refresh, cerrar sesión
      await logout();
      throw err;
    }
  }, [logout]);

  /**
   * Obtener token actual
   */
  const getToken = useCallback((): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }, []);

 


  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    getToken,
    isAdmin,
    isAuthenticated: !!user,
  };
}