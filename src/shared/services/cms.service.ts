// src/shared/services/cms.service.ts
import { api } from './api';
import type { LandingDataResponse } from '../types';

export class CMSService {
  private readonly basePath = 'cms';

  async getLandingData(): Promise<LandingDataResponse> {
    return api.get<LandingDataResponse>(`${this.basePath}/landing`);
  }

  async getSectionContents(sectionId: number) {
    return api.get(`${this.basePath}/sections/${sectionId}/contents`);
  }

async updateContent(
    contentId: number,
    data: {
      data: Record<string, any>;
      status?: 'draft' | 'published';
    },
    token: string | undefined = undefined,
    authorId?: number | null,   // ← nuevo parámetro opcional
  ) {
    return api.put(
      `${this.basePath}/contents/${contentId}`,
      data,
      { token, params: authorId != null ? { author_id: authorId } : undefined },
    );
  }
}

export const cmsService = new CMSService();