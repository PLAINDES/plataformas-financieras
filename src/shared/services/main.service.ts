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
  PaginatedResponse,
  UserResponse,
  UserCreate,
  UserAdminUpdate,
  PaginatedUserResponse,
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
  Delete a template complement by name
  */
  deleteTemplateComplementByName: async (name: string): Promise<void> => {
    return api.delete<void>(`main/template-complements/by-name/${name}`);
  },

  /*
  ============ CALCULATIONS =============
  */

  getCalculations: async (params: {
    userId?: number;
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }): Promise<PaginatedResponse<Calculation>> => {
    const queryParams = new URLSearchParams();
    if (params.userId) queryParams.append("user_id", String(params.userId));
    if (params.page) queryParams.append("page", String(params.page));
    if (params.limit) queryParams.append("limit", String(params.limit));
    if (params.search) queryParams.append("search", params.search);
    if (params.type) queryParams.append("type", params.type);

    const queryString = queryParams.toString();
    const finalUrl = `main/calculations${queryString ? `?${queryString}` : ""}`;

    return api.get<PaginatedResponse<Calculation>>(finalUrl);
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

  refreshCalculation: async (
    id: number,
    prewarmedSessionId?: string | null
  ): Promise<Calculation> => {
    const payload = prewarmedSessionId
      ? { prewarmed_session_id: prewarmedSessionId }
      : {};
    return api.post<Calculation>(`main/calculations/${id}/refresh`, payload);
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
    sector_empresa?: string;
    bono_ajustado?: string;
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

  uploadReportFile: async (id: number, formData: FormData): Promise<void> => {
    // api.post ya detecta si es FormData y omite el Content-Type automáticamente
    return api.post<void>(`main/reports/${id}/upload`, formData);
  },

  generateReportPdf: async (
    reportId: string | number,
    calculationId: string | number,
    isPreview: boolean = true
  ): Promise<Blob> => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      "";

    const rawApiUrl = import.meta.env.DEV
      ? window.location.origin
      : import.meta.env.VITE_API_URL || "";
    const baseUrl = `${rawApiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "")}/api/v1`;

    const timestamp = new Date().getTime();
    const url = `${baseUrl}/main/reports/${reportId}/generate?calculation_id=${calculationId}&is_preview=${isPreview}&_t=${timestamp}`;

    const response = await fetch(
      url,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        detail
          ? `Error al generar el PDF: ${detail}`
          : `Error al generar el PDF (${response.status})`
      );
    }

    const blob = await response.blob();
    return blob;
  },

  // ==================== MASTER TEMPLATES ====================

  getMasterTemplates: async (options?: {
    limit?: number;
    offset?: number;
    search?: string;
    token?: string;
  }): Promise<PaginatedResponse<MasterTemplate>> => {
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
    return api.get<PaginatedResponse<MasterTemplate>>(url, {
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

  // ==================== COVERS ====================
  getCovers: async (): Promise<Cover[]> => {
    return api.get<Cover[]>("main/covers", {
      token: getAuthToken(),
    });
  },

  createCover: async (formData: FormData, token?: string): Promise<Cover> => {
    // By passing FormData to api.post (assuming it's an axios instance),
    // it will automatically set the correct headers (multipart/form-data)
    return api.post<Cover>("main/covers", formData, {
      token: getAuthToken(token),
    });
  },

  getCover: async (id: number, token?: string): Promise<Cover> => {
    return api.get<Cover>(`main/covers/${id}`, {
      token: getAuthToken(token),
    });
  },

  updateCover: async (
    id: number,
    formData: FormData,
    token?: string
  ): Promise<Cover> => {
    return api.put<Cover>(`main/covers/${id}`, formData, {
      token: getAuthToken(token),
    });
  },

  /**
   * Delete a cover by id
   */
  deleteCover: async (id: number, token?: string): Promise<void> => {
    return api.delete<void>(`main/covers/${id}`, {
      token: getAuthToken(token),
    });
  },

  // ==================== CHATBOT ====================
  sendChatMessage: async (payload: {
    message: string;
    history: any[];
    form_data: any;
  }): Promise<any> => {
    return api.post<any>("chatbot/chat", payload);
  },

  analyzeCompanies: async (tickers: string[], onProgress?: (result: any) => void): Promise<any> => {
    const { job_id } = await api.post<any>("chatbot/calculate-subsectores-boa", { tickers });
    while (true) {
      const progress = await api.get<any>(`chatbot/boa-progress/${job_id}`);
      if (progress.result?.valid_companies?.length && progress.status === "running") {
        onProgress?.(progress.result);
      }
      if (progress.status === "completed" || progress.status === "error") {
        return progress.result || { success: false, valid_companies: [] };
      }
      await new Promise(r => setTimeout(r, 1500));
    }
  },

  getActiveBoaJobs: async (): Promise<any> => {
    return api.get<any>("chatbot/boa-active-jobs");
  },

  startSubsectoresBoa: async (tickers: string[]): Promise<any> => {
    return api.post<any>("chatbot/calculate-subsectores-boa", { tickers });
  },

  uploadSubsectoresBoa: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<any>("chatbot/calculate-subsectores-boa/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getBoaProgress: async (jobId: string): Promise<any> => {
    return api.get<any>(`chatbot/boa-progress/${jobId}`);
  },

  cancelBoaJob: async (jobId: string): Promise<any> => {
    return api.post<any>(`chatbot/boa-cancel/${jobId}`);
  },

  deleteBoaJob: async (jobId: string): Promise<any> => {
    return api.post<any>(`chatbot/boa-job/${jobId}/delete`);
  },

  // ==================== USERS ====================
  getUsers: async (options?: {
    limit?: number;
    offset?: number;
    search?: string;
    token?: string;
  }): Promise<PaginatedUserResponse> => {
    const params = new URLSearchParams();
    if (options?.limit !== undefined)
      params.append("limit", options.limit.toString());
    if (options?.offset !== undefined)
      params.append("offset", options.offset.toString());
    if (options?.search) params.append("search", options.search);

    const queryString = params.toString();
    const url = queryString ? `main/users?${queryString}` : "main/users";

    return api.get<PaginatedUserResponse>(url, {
      token: getAuthToken(options?.token),
    });
  },

  getUser: async (id: number, token?: string): Promise<UserResponse> => {
    return api.get<UserResponse>(`main/users/${id}`, {
      token: getAuthToken(token),
    });
  },

  createUser: async (
    data: UserCreate,
    token?: string
  ): Promise<UserResponse> => {
    return api.post<UserResponse>("main/users", data, {
      token: getAuthToken(token),
    });
  },

  updateUser: async (
    id: number,
    data: UserAdminUpdate,
    token?: string
  ): Promise<UserResponse> => {
    return api.put<UserResponse>(`main/users/${id}`, data, {
      token: getAuthToken(token),
    });
  },

  deleteUser: async (id: number, token?: string): Promise<void> => {
    return api.delete<void>(`main/users/${id}`, {
      token: getAuthToken(token),
    });
  },

  // ==================== KAPITAL CONFIGURATIONS ====================

  getKapitalSettings: async (): Promise<{
    max_sensibilizaciones: number;
    [key: string]: any;
  }> => {
    try {
      const response = await api.get<{
        max_sensibilizaciones: number;
        [key: string]: any;
      }>("main/settings/kapital");

      return response;
    } catch (error) {
      console.error("Error obteniendo configuración de Kapital:", error);
      return { max_sensibilizaciones: 3 };
    }
  },

  updateKapitalSetting: async (key: string, value: any): Promise<any> => {
    return api.patch(`main/settings/kapital`, {
      settings: { [key]: value },
    });
  },

  // ==================== VALORA DEBUG COPIES ====================

  getValoraCopies: async (env?: string, includeKapital?: boolean, token?: string): Promise<{
    items: Array<{
      id: string;
      name: string;
      size?: number;
      created_at?: string;
      modified_at?: string;
      web_url?: string;
      download_url?: string;
      env: string;
      folder?: string;
    }>;
    env: string;
  }> => {
    const params = new URLSearchParams();
    if (env) params.append("env", env);
    params.append("include_kapital", includeKapital ? "true" : "false");
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return api.get<any>(`main/master-templates/valora-copies${queryString}`, {
      token: getAuthToken(token),
    });
  },

  getValoraCopyDownloadUrl: async (itemId: string, token?: string): Promise<{
    download_url: string;
    item_id: string;
  }> => {
    return api.get<any>(`main/master-templates/valora-copies/${itemId}/download-url`, {
      token: getAuthToken(token),
    });
  },

  deleteValoraCopy: async (itemId: string, token?: string): Promise<{
    success: boolean;
    deleted_id: string;
  }> => {
    return api.delete<any>(`main/master-templates/valora-copies/${itemId}`, {
      token: getAuthToken(token),
    });
  },

  deleteValoraCopiesBatch: async (ids: string[], token?: string): Promise<{
    success: boolean;
    deleted: string[];
    failed: { id: string; error: string }[];
  }> => {
    return api.post<any>("main/master-templates/valora-copies/delete-batch", { ids }, {
      token: getAuthToken(token),
    });
  },

  // ==================== VALORA TEMPLATE ====================

  getValoraTemplate: async (): Promise<{
    templates: Array<{
      url: string;
      filename: string;
      original_name: string;
      last_modified: string;
      object_key: string;
      is_current?: boolean;
    }>;
  }> => {
    try {
      return await api.get("main/valora-template");
    } catch {
      return { templates: [] };
    }
  },

  uploadValoraTemplate: async (file: File): Promise<{
    templates: Array<{
      url: string;
      filename: string;
      original_name: string;
      last_modified: string;
      object_key: string;
      is_current?: boolean;
    }>;
  }> => {
    const formData = new FormData();
    formData.append("file", file);
    return api.postForm("main/valora-template/upload", formData, {
      token: getAuthToken(),
    });
  },

  setValoraTemplateDefault: async (objectKey: string): Promise<{
    templates: Array<{
      url: string;
      filename: string;
      original_name: string;
      last_modified: string;
      object_key: string;
      is_current?: boolean;
    }>;
  }> => {
    return api.post("main/valora-template/set-default", { object_key: objectKey });
  },

  // ==================== BVL COTIZACIÓN ====================

  getBvlCotizacion: async (): Promise<{
    items: Array<{
      empresa: string;
      id: string;
      numero_acciones: number | null;
      capitalizacion_bursatil: number | null;
      valor_por_accion: number | null;
    }>;
  }> => {
    try {
      return await api.get("main/bvl-cotizacion");
    } catch {
      return { items: [] };
    }
  },

  uploadBvlCotizacion: async (file: File): Promise<{
    items: Array<{
      empresa: string;
      id: string;
      numero_acciones: number | null;
      capitalizacion_bursatil: number | null;
      valor_por_accion: number | null;
    }>;
  }> => {
    const formData = new FormData();
    formData.append("file", file);
    return api.postForm("main/bvl-cotizacion/upload", formData, {
      token: getAuthToken(),
    });
  },

  deleteBvlEmpresa: async (payload: {
    empresa: string;
    id: string;
  }): Promise<{
    items: Array<{
      empresa: string;
      id: string;
      numero_acciones: number | null;
      capitalizacion_bursatil: number | null;
      valor_por_accion: number | null;
    }>;
  }> => {
    return api.delete("main/bvl-cotizacion/empresa", {
      token: getAuthToken(),
      body: payload,
    });
  },
};
