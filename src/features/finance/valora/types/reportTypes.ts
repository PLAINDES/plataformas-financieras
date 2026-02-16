// features/finance/shared/types/reportTypes.ts

export interface ReportProduct {
    id: string;
    name: string;
    iconClassName?: string;
}

export interface ReportContent {
    id: string;
    name: string;
    checked?: boolean;
    disabled?: boolean;
}