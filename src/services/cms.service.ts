// src/services/cms.service.ts

import { api } from './api';
import type { LandingDataResponse } from '../types/landing.types';

export class CMSService {
  private readonly basePath = 'cms';

  // ==================== LANDING (PÚBLICO) ====================

  /**
   * Obtiene todos los datos para renderizar la landing page
   * @param slug - Si no se proporciona, retorna la homepage
   */
  async getLandingData(): Promise<LandingDataResponse> {
    const result = api.get<LandingDataResponse>(`${this.basePath}/landing`);
    return result;
  }

  // ==================== SECTIONS (PÚBLICO/ADMIN) ====================

  /**
   * Obtiene contenidos de una sección para edición
   * @param sectionId - ID de la sección
   */
  async getSectionContents(sectionId: number): Promise<{
    section: {
      id: number;
      name: string;
      component: string;
      order: number;
      is_visible: boolean;
      page_id: number;
    };
    contents: Array<{
      section_content_id: number;
      order: number;
      is_visible: boolean;
      content: {
        id: number;
        slug: string;
        data: Record<string, any>;
        status: string;
        content_type_id: number;
      };
    }>;
  }> {
    return api.get(`${this.basePath}/sections/${sectionId}/contents`);
  }

  // ==================== CONTENT UPDATES (ADMIN) ====================

  /**
   * Actualiza el contenido de una sección
   * @param contentId - ID del contenido a actualizar
   * @param data - Nuevos datos del contenido
   * @param token - Token de autenticación
   */
  async updateContent(
    contentId: number,
    data: {
      data: Record<string, any>;
      status?: 'draft' | 'published';
    },
    token: string | null = null
  ): Promise<{
    success: boolean;
    message: string;
    content: {
      id: number;
      slug: string;
      data: Record<string, any>;
      status: string;
      updated_at: string;
    };
  }> {
    return api.put(`${this.basePath}/contents/${contentId}`, data, { token });
  }
}

export const cmsService = new CMSService();