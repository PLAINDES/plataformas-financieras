import { api } from "./api";
import type {
  TemplateComplement,
  TemplateComplementCreate,
  TemplateComplementUpdate,
  Calculation,
  CalculationCreate,
  CalculationUpdate,
  Report,
  ReportUpdate,
  Cover,
  MasterTemplate,
  MasterTemplateCreate,
  MasterTemplateUpdate,
} from "../types";

const getAuthToken = (token?: string): string | undefined => {
  if (token) return token;
  const fromStorage = localStorage.getItem("auth_token");
  return fromStorage || undefined;
};

export const MainService = {
  // ==================== TEMPLATE COMPLEMENTS ====================

  /*
  List all template complements
  */
  getTemplateComplements: async (
    activeTab: string,
    onlyName?: boolean,
    onlyDate?: boolean
  ): Promise<any> => {
    const params = new URLSearchParams();

    if (onlyName) {
      params.append("only-name", "true");
    }

    if (onlyDate) {
      params.append("only-date", "true");
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";

    return api.get<TemplateComplement[]>(
      `main/template-complements/by-name/${activeTab}${queryString}`
    );
  },

  /*
  Get a specific exact value for complements like tax (ir) and devaluation
  */
  getComplementSpecificValue: async (
    name: string,
    year: string,
    country: string,
    period?: string
  ): Promise<{ valor: number | null }> => {
    const params = new URLSearchParams({ year, country });
    if (period) params.append("period", period);

    return api.get<{ valor: number | null }>(
      `main/template-complements/by-name/${name}?${params.toString()}`
    );
  },

  /*
  Get a specific template complement by ID
  */
  getTemplateComplement: async (id: number): Promise<TemplateComplement> => {
    return api.get<TemplateComplement>(`main/template-complements/${id}`);
  },

  /*
  Create a new template complement
  */
  createTemplateComplement: async (
    data: TemplateComplementCreate
  ): Promise<TemplateComplement> => {
    return api.post<TemplateComplement>("main/template-complements", data);
  },

  /*
  Update an existing template complement
  */
  updateTemplateComplement: async (
    id: number,
    data: TemplateComplementUpdate
  ): Promise<TemplateComplement> => {
    return api.put<TemplateComplement>(`main/template-complements/${id}`, data);
  },

  /*
  Delete a template complement
  */
  deleteTemplateComplement: async (id: number): Promise<void> => {
    return api.delete<void>(`main/template-complements/${id}`);
  },

  /*
  ============ CALCULATIONS =============
  */

  getCalculations: async (userId?: number): Promise<Calculation[]> => {
    const params = userId !== undefined ? `?user_id=${userId}` : "";
    return api.get<Calculation[]>(`main/calculations${params}`);
  },

  getCalculation: async (id: number): Promise<Calculation> => {
    return api.get<Calculation>(`main/calculations/${id}`);
  },

  getCalculationByCode: async (code: string): Promise<Calculation> => {
    return api.get<Calculation>(`main/calculations/by-code/${code}`);
  },

  createCalculation: async (data: CalculationCreate): Promise<Calculation> => {
    return api.post<Calculation>("main/calculations", data);
  },

  updateCalculation: async (
    id: number,
    data: CalculationUpdate
  ): Promise<Calculation> => {
    return api.put<Calculation>(`main/calculations/${id}`, data);
  },

  deleteCalculation: async (id: number): Promise<void> => {
    return api.delete<void>(`main/calculations/${id}`);
  },

  prewarmSession: async (): Promise<{ session_id: string }> => {
    return api.post<{ session_id: string }>("main/calculations/prewarm");
  },

  keepAliveSession: async (sessionId: string): Promise<void> => {
    return api.post<void>("main/calculations/prewarm/keep-alive", {
      session_id: sessionId,
    });
  },

  getReports: async (params?: {
    limit?: number;
    page?: number;
    search?: string;
    type?: string;
    activo?: boolean;
  }): Promise<Report[]> => {
    return api.get<Report[]>("main/reports", { params });
  },

  getReport: async (id: number): Promise<Report> => {
    return api.get<Report>(`main/reports/${id}`);
  },

  updateReport: async (id: number, data: ReportUpdate): Promise<Report> => {
    return api.put<Report>(`main/reports/${id}`, data);
  },

  createReport: async (data: ReportUpdate): Promise<Report> => {
    return api.post<Report>("main/reports", data);
  },

  getReportContent: async (id: number): Promise<string> => {
    const res = await api.get<{ html: string }>(`main/reports/${id}/content`);
    return res.html;
  },

  // Reemplaza tu uploadReportFile actual por este:
  uploadReportFile: async (id: number, formData: FormData): Promise<void> => {
    // api.post ya detecta si es FormData y omite el Content-Type automáticamente
    return api.post<void>(`main/reports/${id}/upload`, formData);
  },

  getCovers: async (): Promise<Cover[]> => {
    return api.get<Cover[]>("main/covers");
  },
  // ==================== MASTER TEMPLATES ====================

  getMasterTemplates: async (options?: {
    limit?: number;
    offset?: number;
    search?: string;
    token?: string;
  }): Promise<MasterTemplate[]> => {
    const params = new URLSearchParams();
    if (options?.limit !== undefined)
      params.append("limit", options.limit.toString());
    if (options?.offset !== undefined)
      params.append("offset", options.offset.toString());
    if (options?.search) params.append("search", options.search);
    const queryString = params.toString();
    const url = queryString
      ? `main/master-templates?${queryString}`
      : "main/master-templates";
    return api.get<MasterTemplate[]>(url, {
      token: getAuthToken(options?.token),
    });
  },

  getMasterTemplate: async (
    id: number,
    token?: string
  ): Promise<MasterTemplate> => {
    return api.get<MasterTemplate>(`main/master-templates/${id}`, {
      token: getAuthToken(token),
    });
  },

  createMasterTemplate: async (
    data: MasterTemplateCreate,
    token?: string
  ): Promise<MasterTemplate> => {
    return api.post<MasterTemplate>("main/master-templates", data, {
      token: getAuthToken(token),
    });
  },

  updateMasterTemplate: async (
    id: number,
    data: MasterTemplateUpdate,
    token?: string
  ): Promise<MasterTemplate> => {
    return api.put<MasterTemplate>(`main/master-templates/${id}`, data, {
      token: getAuthToken(token),
    });
  },

  setDefaultMasterTemplate: async (
    id: number,
    token?: string
  ): Promise<MasterTemplate> => {
    return api.post<MasterTemplate>(
      `main/master-templates/${id}/set-default`,
      {},
      {
        token: getAuthToken(token),
      }
    );
  },

  deleteMasterTemplate: async (id: number, token?: string): Promise<void> => {
    return api.delete<void>(`main/master-templates/${id}`, {
      token: getAuthToken(token),
    });
  },

  uploadMasterTemplateFile: async (
    id: number,
    file: File,
    token?: string
  ): Promise<any> => {
    const form = new FormData();
    form.append("file", file);
    // Retorna { template, extracted_codes, statistics, processed_sheets }
    return api.postForm<any>(`main/master-templates/${id}/upload`, form, {
      token: getAuthToken(token),
    });
  },

  reUploadMasterTemplateFile: async (
    id: number,
    file: File,
    token?: string
  ): Promise<any> => {
    const form = new FormData();
    form.append("file", file);
    // Retorna { comparison, errors, statistics }
    return api.postForm<any>(`main/master-templates/${id}/re-upload`, form, {
      token: getAuthToken(token),
    });
  },

  downloadMasterTemplateUrl: (id: number): string => {
    const base = import.meta.env.DEV
      ? `${window.location.origin}/api/v1/`
      : `${import.meta.env.VITE_API_URL}/api/v1/`;
    return `${base}main/master-templates/${id}/download`;
  },

  getMasterTemplateCodes: async (
    id: number,
    token?: string
  ): Promise<{
    template_id: number;
    template_name: string;
    codes: {
      valora: any[];
      kapital: any[];
    };
    statistics: {
      total: number;
      valora: number;
      kapital: number;
    };
  }> => {
    return api.get<any>(`main/master-templates/${id}/codes`, {
      token: getAuthToken(token),
    });
  },

  getMasterTemplateChartImages: async (
    id: number,
    token?: string
  ): Promise<{
    template_id: number;
    template_name: string;
    valora: any[];
    kapital: any[];
    total: number;
  }> => {
    return api.get<any>(`main/master-templates/${id}/chart-images`, {
      token: getAuthToken(token),
    });
  },
  getCurrentMasterTemplateCodes: async (): Promise<any> => {
    return api.get<any>(`main/reports/get-current-codes`);
  },
  createCover: async (formData: FormData): Promise<Cover> => {
    // By passing FormData to api.post (assuming it's an axios instance),
    // it will automatically set the correct headers (multipart/form-data)
    return api.post<Cover>("main/covers", formData);
  },

  getCover: async (id: number): Promise<Cover> => {
    return api.get<Cover>(`main/covers/${id}`);
  },

  updateCover: async (id: number, formData: FormData): Promise<Cover> => {
    const BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1/`;
    const res = await fetch(`${BASE_URL}main/covers/${id}`, {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        (err as { detail?: string }).detail ?? `Update failed: ${res.status}`
      );
    }
    return res.json();
  },

  /*
  // Reemplaza tu updateCover actual por este:
  updateCover: async (id: number, formData: FormData): Promise<Cover> => {
    // api.put también maneja FormData perfectamente según tu api.ts
    return api.put<Cover>(`main/covers/${id}`, formData);
  },
  */

  /**
   * Delete a cover by id
   */
  deleteCover: async (id: number): Promise<void> => {
    return api.delete<void>(`main/covers/${id}`);
  },

  // ==================== CHATBOT ====================
  sendChatMessage: async (payload: {
    message: string;
    history: any[];
    form_data: any;
  }): Promise<any> => {
    return api.post<any>("chatbot/chat", payload);
  },

  analyzeCompanies: async (tickers: string[]): Promise<any> => {
    return api.post<any>("chatbot/analyze-companies", { tickers });
  },
};
