export interface BaseComplementItem {
  id?: number;
  fecha: string;
  _complementId?: number;
  [key: string]: any;
}

// 1. Tasa RF
export interface RiskFreeRateItem extends BaseComplementItem {
  // Maturities in years (approx)
  "0.08"?: number; // 1 month
  "0.17"?: number; // 2 months
  "0.25"?: number; // 3 months
  "0.50"?: number; // 6 months
  "1.00"?: number; // 1 year
  "2.00"?: number;
  "3.00"?: number;
  "5.00"?: number;
  "7.00"?: number;
  "10.00"?: number;
  "20.00"?: number;
  "30.00"?: number;
}

// 2. Prima de mercado
export interface MarketPremiumItem extends BaseComplementItem {
  rm_tbonds_actual: number;
  rm: number;
  rf_tbonds: number;
}

// 3. IR (Inflation/Risk) - Covers all countries listed
export interface CountryRiskItem extends BaseComplementItem {
  pais: string;
  valor: number;
}

// 4. Damodaran
export interface DamodaranItem extends BaseComplementItem {
  industria: string;
  d_sobre_def: number; // D/(D+E)
  e_sobre_de: number; // E/(D+E)
  tax_rate: number;
  beta: number;
  std_dev_stock: number;
  spread_debt: number;
}

// ==================== MASTER TEMPLATE TYPES ====================
export type MasterTemplateType = "valora" | "kapital";

export interface MasterTemplate {
  id: number;
  nombre: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  hojas_config: Record<string, any> | null;
  onedrive_env: string | null;
  onedrive_folder: string | null;
  onedrive_item_id: string | null;
  onedrive_filename: string | null;
  original_filename: string | null;
  onedrive_path: string | null;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MasterTemplateCreate {
  nombre: string;
  description?: string;
  is_active?: boolean;
  is_default?: boolean;
  hojas_config?: Record<string, any>;
}

export interface MasterTemplateUpdate {
  nombre?: string;
  description?: string;
  is_active?: boolean;
  is_default?: boolean;
  hojas_config?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ==================== TEMPLATE CODE TYPES ================================
export interface TemplateCode {
  id: number;
  template_code_image_id: number | null;
  type: "valora" | "kapital";
  hoja: string | null;
  nombre: string;
  code: string;
  template_ids: number[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ExtractedCodesResponse {
  template: MasterTemplate;
  extracted_codes: {
    valora: TemplateCode[];
    kapital: TemplateCode[];
  };
  statistics: {
    total_codes: number;
    valora_codes: number;
    kapital_codes: number;
    sheets_processed: number;
    sheets: Array<{
      name: string;
      type: "valora" | "kapital";
      codes_count: number;
    }>;
  };
  processed_sheets: Array<{
    name: string;
    type: "valora" | "kapital";
    codes_count: number;
  }>;
}

// 4.1 Cost of Debt Lookup (Auxiliary data for Damodaran year)
export interface DamodaranSpreadItem extends BaseComplementItem {
  min_std_dev: number;
  max_std_dev: number;
  spread: number;
}

// 5. Devaluación (Anual) y 6. EMBI con claves dinamicas
// Permite cualquier nombre de pais como clave
export interface DynamicCountryItem extends BaseComplementItem {
  periodo?: number; // Opcional, usado en devaluacion
  [country: string]: any; // Claves dinámicas para países
}

// 7. Tipos unificados para export
export type FinancialItem =
  | RiskFreeRateItem
  | MarketPremiumItem
  | CountryRiskItem
  | DamodaranItem
  | DynamicCountryItem;

// Alias para compatibilidad con ConfiguracionPage
export type BaseFinancialItem = BaseComplementItem;
