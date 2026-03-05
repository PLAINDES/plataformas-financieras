import type { EditableContent } from '../../../types/editable.types';

// Legacy type
export interface BenefitsContent {
  title: string;
  subtitle: string;
}


export interface BenefitsSectionProps {
  content: BenefitsContent;
  onSave: (content: EditableContent) => Promise<void>;
}

// Tipos para los datos del gráfico
export interface IndustryData {
  industry: string;
  value: number;
  label: string;
}

export interface YearOption {
  year: number;
}

// Componente de gráfico de barras simple
export interface SimpleBarChartProps {
  data: IndustryData[];
  selectedIndustry: string;
  height?: number;
}
