/**
 * Constantes para plantillas maestras
 */

// Hojas de Excel y sus tipos de template asociados
export const TEMPLATE_SHEET_NAMES = {
  VALORA: "Plantilla Usuario", // Contiene códigos VALORA
  KAPITAL: "WACC", // Contiene códigos KAPITAL
} as const;

// Mapeo inverso: hoja -> tipo
export const SHEET_TO_TYPE_MAP: Record<string, "valora" | "kapital"> = {
  [TEMPLATE_SHEET_NAMES.VALORA]: "valora",
  [TEMPLATE_SHEET_NAMES.KAPITAL]: "kapital",
} as const;

// Colores para cada tipo
export const TEMPLATE_TYPE_COLORS = {
  valora: {
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-800",
    text: "text-green-600",
    hover: "hover:bg-green-50/50",
  },
  kapital: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-800",
    text: "text-purple-600",
    hover: "hover:bg-purple-50/50",
  },
} as const;

// Labels para UI
export const TEMPLATE_TYPE_LABELS = {
  valora: "Valora",
  kapital: "Kapital",
} as const;
