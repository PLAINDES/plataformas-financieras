import type { ToastType } from "./toast.types";

export interface KapitalFormData {
    date: string;
    sector: string;
    subsector?: string;
    tickers_subsector?: string;
    subsector_sensibilizacion?: string;
    tickers_subsector_sensibilizacion?: string;
    beta_unlevered_industry: string;
    instrument: string;
    bono: string;
    country: string;
    devaluation: string;
    tax: string;
    typeId: boolean;
    currency: string;
    kd: string;
    debt: string;
    capital: string;
    dc_ratio: string;
    effective_tax_rate: string;
    beta_levered: string;
    beta_unlevered: string;
    beta_unlevered_custom?: string;
}

export interface KapitalMarketResults {
    cppc: number | string;
    kd: number | string;
    ke: number | string;
    koa: number | string;
    "kd(1-t)": string | number;
    d_empresa: string | number;
}

export interface KapitalResults {
    cppc: number | string;
    kd: number | string;
    ke: number | string;
    koa: number | string;
    boa?: number;
    boa_custom?: number;
    emergent: KapitalMarketResults;
    developed: KapitalMarketResults;
    empresa_dolares: KapitalMarketResults;
    empresa_soles: KapitalMarketResults;
    d_empresa: string | number;
}

export interface SensibilizacionEntry {
    created_at?: string;
    boa?: number;
    mercado_desarrollado?: KapitalMarketResults;
    mercado_emergente?: KapitalMarketResults;
    empresa_dolares?: KapitalMarketResults;
    empresa_soles?: KapitalMarketResults;
    subsector?: string;
    tickers?: string;
}

export interface MethodologyItem {
    name: string;
    file: string;
}

export interface MethodologyCategory {
    name: string;
    products: MethodologyItem[];
}

export interface UseKapitalCalculationProps {
    formData: KapitalFormData;
    setFormData: React.Dispatch<React.SetStateAction<KapitalFormData>>;
    prewarmedSessionId: string | null;
    setPrewarmedSessionId: React.Dispatch<React.SetStateAction<string | null>>;
    addToast: (message: string, type?: ToastType) => void;
    userId?: number | string;
    ui: {
        setShowResults: (val: boolean) => void;
        setIsFormOpen: (val: boolean) => void;
        setResultsSection: (val: "result" | "sensitivity") => void;
        setShowComparison: (val: boolean) => void;
    };
}
