// src/services/api.ts

// In dev, proxy via Vite (/api → backend) except for large PDF uploads which bypass proxy to avoid 4MB limit/hang
const API_BASE_URL = import.meta.env.DEV
  ? `${window.location.origin}/api/v1/`
  : `${import.meta.env.VITE_API_URL}/api/v1/`;
const DIRECT_API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000") + "/api/v1/";

interface RequestOptions {
  token?: string;
  params?: Record<string, any>;
  body?: any;
  signal?: AbortSignal;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(token?: string, isFormData: boolean = false): HeadersInit {
    const headers: HeadersInit = {};

    // Solo agregamos Content-Type: application/json si NO es FormData.
    // fetch() necesita calcular automáticamente el Content-Type para FormData
    // y asignar el boundary. Si lo seteamos manualmente fallará.
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

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
        const errorData: any = await response.json();
        console.error("[API Error Response Data]:", errorData);
        errorMessage =
          errorData.detail || JSON.stringify(errorData) || errorMessage;
      } catch {
        console.error("[API Error Response Text]: Could not parse JSON");
      }

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

    const isFormData = data instanceof FormData;
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(options?.token, isFormData),
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(
    endpoint: string,
    data: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);

    const isFormData = data instanceof FormData;

    const response = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(options?.token, isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(
    endpoint: string,
    data: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);

    const isFormData = data instanceof FormData;

    const response = await fetch(url, {
      method: "PATCH",
      headers: this.getHeaders(options?.token, isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(options?.token),
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /* Upload FormData (multipart). Do NOT set Content-Type — browser sets it with boundary. */
  async postForm<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions & { direct?: boolean }
  ): Promise<T> {
    const useDirect = (options as any)?.direct;
    const base = useDirect ? DIRECT_API_URL : this.baseURL;
    const url = new URL(endpoint, base).toString() + (options?.params ? "?" + new URLSearchParams(options.params as any).toString() : "");
    console.log(`[API] postForm ${useDirect ? "DIRECT" : "PROXY"} -> ${url}`);

    const headers: HeadersInit = {};
    if (options?.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      signal: options?.signal,
    });

    return this.handleResponse<T>(response);
  }
}

export const api = new APIClient(API_BASE_URL);
