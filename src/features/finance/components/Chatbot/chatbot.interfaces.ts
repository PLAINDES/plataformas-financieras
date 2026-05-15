export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  time: string;
  isHtml?: boolean;
}

export interface FormData {
  [key: string]: string;
}

export interface CompanyData {
  ticker: string;
  company_name: string;
  country: string;
  sector: string;
  dc_ratio: number | null;
  effective_tax_rate: number | null;
  beta_levered: number | null;
  beta_unlevered: number | null;
}

export interface YahooFinanceData {
  success: boolean;
  valid_companies: CompanyData[];
  group_statistics?: {
    avg_beta_unlevered?: number;
    avg_dc_ratio?: number;
    avg_tax_rate?: number;
    median_beta_unlevered?: number;
    median_dc_ratio?: number;
    median_tax_rate?: number;
  };
}

export interface FinancialData {
  dc_ratio?: number;
  effective_tax_rate?: number;
  beta_levered?: number | null;
  beta_unlevered?: number;
}

export interface ChatbotProps {
  formData?: any;
  isWaccCalculated?: boolean;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onCalculateWacc: (beta: string) => void;
}
