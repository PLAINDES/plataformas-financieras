// src/services/api.ts

import type { APIError } from '../types/api.types';

const API_BASE_URL = 'http://localhost:8000/api/v1/';

interface RequestOptions {
  token?: string;
  params?: Record<string, any>;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Construye headers para las peticiones
   */
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Construye URL con query params
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Maneja errores de la API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData: APIError = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // Si no se puede parsear el error, usar mensaje genérico
      }

      throw new Error(errorMessage);
    }

    // Para respuestas 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(options?.token),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(options?.token),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string, 
    data: any, 
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(options?.token),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string, 
    data: any, 
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(options?.token),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(options?.token),
    });

    return this.handleResponse<T>(response);
  }
}

export const api = new APIClient(API_BASE_URL);