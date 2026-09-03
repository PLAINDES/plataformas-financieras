export interface FormData {
  date: string;
  sector: string;
  subsector: string;
  tickers_subsector: string;
  subsector_sensibilizacion?: string;
  tickers_subsector_sensibilizacion?: string;
  beta_unlevered_industry: string;
  beta_subsector: string;
  instrument?: string;
  bono?: string;
  country: string;
  devaluation?: string;
  tax?: string;
  currency: string;
  shares: string;
  kd?: string;
  debt?: string;
  capital?: string;
  typeId?: boolean;
  useFinancialData?: boolean;
  dc_ratio?: string;
  effective_tax_rate?: string;
  beta_levered?: string;
  beta_unlevered?: string;
  fileUsername: string;
  action: string;
  longgrowth: string;
  capitalcost: string;
  revenuegrowth: string;
  revenue_forecast_rate: string;
  fdc_forecast_rate: string;
  perpetual_growth_rate: string;
  beta_unlevered_sensitivity: string;
}

export interface FinancialTableRow {
  label: string;
  values: Array<string | number | null>;
}

export interface FinancialTable {
  title: string;
  years: string[];
  rows: FinancialTableRow[];
}

export interface ValoraMethodResults {
  activo?: string | number | null;
  pasivo?: string | number | null;
  empresa?: string | number | null;
  patrimonio?: string | number | null;
  precio_accion?: string | number | null;
  tasa_forecast?: string | number | null;
  tasa_perpetua?: string | number | null;
}

export interface ValoraCalculationResults {
  wacc?: string | number | null;
  wacc_emergente?: string | number | null;
  source_currency?: string | null;
  fx_to_usd?: number | null;
  inputs?: {
    moneda?: string | null;
  };
  balance?: {
    activo?: string | number | null;
    pasivo?: string | number | null;
    patrimonio?: string | number | null;
  };
  conceptos?: ValoraMethodResults;
  integrado?: ValoraMethodResults;
  conceptos_emergente?: ValoraMethodResults;
  integrado_emergente?: ValoraMethodResults;
}

export interface ValoraSensibilidadEntry {
  created_at?: string;
  subsector?: string;
  industria?: string;
  tickers?: string;
  wacc?: number;
  revenue_forecast_rate?: number;
  fdc_forecast_rate?: number;
  perpetual_growth_rate?: number;
  inputs?: any;
}
