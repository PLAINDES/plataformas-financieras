import { api } from "./api";
import type {
  TemplateComplement,
  TemplateComplementCreate,
  TemplateComplementUpdate,
  Calculation,
  Report,
  ReportUpdate,
  Cover
} from "../types";

export const MainService = {
  // ==================== TEMPLATE COMPLEMENTS ====================

  /**
   * List all template complements
   */
  getTemplateComplements: async (): Promise<TemplateComplement[]> => {
    return api.get<TemplateComplement[]>("main/template-complements");
  },

  /**
   * Get a specific template complement by ID
   */
  getTemplateComplement: async (id: number): Promise<TemplateComplement> => {
    return api.get<TemplateComplement>(`main/template-complements/${id}`);
  },

  /**
   * Create a new template complement
   */
  createTemplateComplement: async (
    data: TemplateComplementCreate
  ): Promise<TemplateComplement> => {
    return api.post<TemplateComplement>("main/template-complements", data);
  },

  /**
   * Update an existing template complement
   */
  updateTemplateComplement: async (
    id: number,
    data: TemplateComplementUpdate
  ): Promise<TemplateComplement> => {
    return api.put<TemplateComplement>(`main/template-complements/${id}`, data);
  },

  /**
   * Delete a template complement
   */
  deleteTemplateComplement: async (id: number): Promise<void> => {
    return api.delete<void>(`main/template-complements/${id}`);
  },

  getCalculations: async (userId?: number): Promise<Calculation[]> => {
    const params = userId !== undefined ? `?user_id=${userId}` : "";
    return api.get<Calculation[]>(`main/calculations${params}`);
  },

  deleteCalculation: async (id: number): Promise<void> => {
    return api.delete<void>(`main/calculations/${id}`);
  },

  getReports: async (): Promise<Report[]> => {
    return api.get<Report[]>("main/reports");
  },

  getReport: async (id: number): Promise<Report> => {
    return api.get<Report>(`main/reports/${id}`);
  },

  updateReport: async (id: number, data: ReportUpdate): Promise<{ message: string }> => {
    return api.put<{ message: string }>(`main/reports/${id}`, data);
  },

  getCovers: async (): Promise<Cover[]> => {
    return api.get<Cover[]>("main/covers");
  },
};
