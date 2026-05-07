export interface FormData {
  date: string;
  sector: string;
  beta_unlevered_industry: string;
  instrument?: string;
  bono?: string;
  country: string;
  devaluation?: string;
  tax?: string;
  currency: string;
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
