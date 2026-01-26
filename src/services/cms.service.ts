// src/services/cms.service.ts

import { api } from './api';
import type {
  LandingDataResponse,
  PageResponse,
  PageWithSections,
  PageCreate,
  PageUpdate,
  SectionResponse,
  SectionCreate,
  SectionUpdate,
  ContactMessageCreate,
  ContactMessageUpdate,
  ContactMessageResponse,
  MediaCreate,
  MediaResponse,
  AdminDashboardStats
} from '../types/api.types';

export class CMSService {
  private readonly basePath = 'cms';

  // ==================== LANDING (PÚBLICO) ====================

  /**
   * Obtiene todos los datos para renderizar la landing page
   * @param slug - Si no se proporciona, retorna la homepage
   */
  async getLandingData(): Promise<{ sections: SectionResponse[] }> {
    const res = await fetch('/landing');
    return res.json();
  }


  // ==================== PAGES (ADMIN) ====================

  /**
   * Lista todas las páginas (solo admin)
   */
  async getAllPages(token: string, statusFilter?: 'draft' | 'published'): Promise<PageResponse[]> {
    const params = statusFilter ? { status_filter: statusFilter } : {};
    return api.get<PageResponse[]>(`${this.basePath}/pages`, { token, params });
  }

  /**
   * Obtiene una página con sus secciones (solo admin)
   */
  async getPage(pageId: number, token: string): Promise<PageWithSections> {
    return api.get<PageWithSections>(`${this.basePath}/pages/${pageId}`, { token });
  }

  /**
   * Crea una nueva página (solo admin)
   */
  async createPage(data: PageCreate, token: string): Promise<PageResponse> {
    return api.post<PageResponse>(`${this.basePath}/pages`, data, { token });
  }

  /**
   * Actualiza una página (solo admin)
   */
  async updatePage(pageId: number, data: PageUpdate, token: string): Promise<PageResponse> {
    return api.put<PageResponse>(`${this.basePath}/pages/${pageId}`, data, { token });
  }

  /**
   * Elimina una página (solo admin)
   */
  async deletePage(pageId: number, token: string): Promise<void> {
    await api.delete(`${this.basePath}/pages/${pageId}`, { token });
  }

  // ==================== SECTIONS (ADMIN) ====================

  /**
   * Crea una nueva sección (solo admin)
   */
  async createSection(data: SectionCreate, token: string): Promise<SectionResponse> {
    return api.post<SectionResponse>(`${this.basePath}/sections`, data, { token });
  }

  /**
   * Actualiza una sección (solo admin)
   */
  async updateSection(
    sectionId: number, 
    data: SectionUpdate, 
    token: string
  ): Promise<SectionResponse> {
    return api.put<SectionResponse>(`${this.basePath}/sections/${sectionId}`, data, { token });
  }

  /**
   * Elimina una sección (solo admin)
   */
  async deleteSection(sectionId: number, token: string): Promise<void> {
    await api.delete(`${this.basePath}/sections/${sectionId}`, { token });
  }

  // ==================== CONTACT ====================

  /**
   * Crea un mensaje de contacto (público)
   */
  async createContactMessage(data: ContactMessageCreate): Promise<ContactMessageResponse> {
    return api.post<ContactMessageResponse>(`${this.basePath}/contact`, data);
  }

  /**
   * Lista mensajes de contacto (solo admin)
   */
  async getContactMessages(
    token: string,
    statusFilter?: 'unread' | 'read' | 'replied',
    limit?: number
  ): Promise<ContactMessageResponse[]> {
    const params: Record<string, any> = {};
    if (statusFilter) params.status_filter = statusFilter;
    if (limit) params.limit = limit;
    
    return api.get<ContactMessageResponse[]>(`${this.basePath}/contact`, { token, params });
  }

  /**
   * Actualiza el estado de un mensaje (solo admin)
   */
  async updateMessageStatus(
    messageId: number,
    data: ContactMessageUpdate,
    token: string
  ): Promise<ContactMessageResponse> {
    return api.patch<ContactMessageResponse>(
      `${this.basePath}/contact/${messageId}`,
      data,
      { token }
    );
  }

  // ==================== MEDIA (ADMIN) ====================

  /**
   * Lista archivos media (solo admin)
   */
  async getMedia(
    token: string,
    folder?: string,
    mimeType?: string
  ): Promise<MediaResponse[]> {
    const params: Record<string, any> = {};
    if (folder) params.folder = folder;
    if (mimeType) params.mime_type = mimeType;
    
    return api.get<MediaResponse[]>(`${this.basePath}/media`, { token, params });
  }

  /**
   * Registra un nuevo archivo media (solo admin)
   */
  async createMedia(data: MediaCreate, token: string): Promise<MediaResponse> {
    return api.post<MediaResponse>(`${this.basePath}/media`, data, { token });
  }

  // ==================== DASHBOARD (ADMIN) ====================

  /**
   * Obtiene estadísticas para el dashboard admin
   */
  async getDashboardStats(token: string): Promise<AdminDashboardStats> {
    return api.get<AdminDashboardStats>(`${this.basePath}/dashboard/stats`, { token });
  }
}

export const cmsService = new CMSService();