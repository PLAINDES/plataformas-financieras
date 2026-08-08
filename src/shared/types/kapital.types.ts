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
    beta_subsector?: string;
}

export interface KapitalMarketResults {
    cppc: number | string;
    kd: number | string;
    ke: number | string;
    koa: number | string;
    "kd(1-t)": string | number;
    d_empresa: string | number;
    inputs?: any;
    industria?: string;
    subsector?: string;
}

export interface KapitalResults {
    cppc: number | string;
    kd: number | string;
    ke: number | string;
    koa: number | string;
    boa?: number;
    boa_custom?: number;
    boa_sector?: number;
    boa_subsector?: number;
    emergent: KapitalMarketResults;
    developed: KapitalMarketResults;
    mercado_desarrollado: KapitalMarketResults;
    mercado_emergente_dolares: KapitalMarketResults;
    mercado_emergente_moneda_local: KapitalMarketResults;
    empresa_dolares: KapitalMarketResults;
    empresa_soles: KapitalMarketResults;
    empresa_moneda_local: KapitalMarketResults;
    d_empresa: string | number;
    industria?: string;
    subsector?: string;
    pais?: string;
    inputs?: any;
}

export interface SensibilizacionEntry {
    created_at?: string;
    boa?: number;
    boa_sector?: number;
    boa_subsector?: number;
    beta_subsector?: number;
    mercado_desarrollado?: KapitalMarketResults;
    mercado_emergente?: KapitalMarketResults;
    mercado_emergente_dolares?: KapitalMarketResults;
    mercado_emergente_moneda_local?: KapitalMarketResults;
    empresa_dolares?: KapitalMarketResults;
    empresa_soles?: KapitalMarketResults;
    empresa_moneda_local?: KapitalMarketResults;
    subsector?: string;
    industria?: string;
    tickers?: string;
    inputs?: any;
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
    trackEvent: (eventName: string, eventMetadata?: Record<string, any>) => Promise<void>;
    userId?: number | string;
    ui: {
        setShowResults: (val: boolean) => void;
        setIsFormOpen: (val: boolean) => void;
        setResultsSection: (val: "result" | "sensitivity") => void;
        setShowComparison: (val: boolean) => void;
    };
}
