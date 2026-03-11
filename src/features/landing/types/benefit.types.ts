import type { EditableContent } from "@/shared/types/editable.types";

export interface BenefitsContent {
  title: string;
  subtitle: string;
}

export interface BenefitsSectionProps {
  content: BenefitsContent;
  onSave: (content: EditableContent) => Promise<void>;
}

export interface IndustryData {
  industry: string;
  value: number;
  label: string;
}

export interface YearOption {
  year: number;
}

export interface SimpleBarChartProps {
  data: IndustryData[];
  selectedIndustry: string;
  height?: number;
}
