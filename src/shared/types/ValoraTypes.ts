export interface FormData {
  date: string;
  sector: string;
  subsector: string;
  tickers_subsector: string;
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
