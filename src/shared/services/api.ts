// src/services/api.ts

import type { APIError } from "../types/api.types";

// In dev, route through Vite's proxy (/api → backend) to avoid CORS.
// In production, use the explicit API URL from env.
const API_BASE_URL = import.meta.env.DEV
  ? `${window.location.origin}/api/v1/`
  : `${import.meta.env.VITE_API_URL}/api/v1/`;

interface RequestOptions {
  token?: string;
  params?: Record<string, any>;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

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

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorData: APIError = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {}

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(options?.token),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(options?.token),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(
    endpoint: string,
    data: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);

    const response = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(options?.token),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(
    endpoint: string,
    data: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);

    const response = await fetch(url, {
      method: "PATCH",
      headers: this.getHeaders(options?.token),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(options?.token),
    });

    return this.handleResponse<T>(response);
  }

  /* Upload FormData (multipart). Do NOT set Content-Type — browser sets it with boundary. */
  async postForm<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);

    const headers: HeadersInit = {};
    if (options?.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

export const api = new APIClient(API_BASE_URL);
