export interface FormData {
  date: string;
  country: string;
  currency: string;
  sector: string;
  fileUsername: string;
  action: string;
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
