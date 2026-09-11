import type { ReactNode } from "react";
import { BarChart3 } from "lucide-react";
import { TemplateIcon } from "@/shared/components/icons/TemplateIcon";
import { CoverIcon } from "@/shared/components/icons/CoverIcon";
import { ReportIcon } from "@/shared/components/icons/ReportIcon";

export interface DashboardModule {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}

export interface GettingStartedStep {
  title: string;
  description: string;
  href: string;
  cta: string;
}

export const dashboardModules: DashboardModule[] = [
  {
    title: "Plantillas Maestras",
    description: "Sube y versiona las plantillas de cálculo.",
    href: "/admin/master/plantillas",
    icon: <TemplateIcon />,
  },
  {
    title: "Portadas",
    description: "Crea y edita las portadas de los reportes.",
    href: "/admin/portadas",
    icon: <CoverIcon />,
  },
  {
    title: "Reportes",
    description: "Genera y administra los reportes publicados.",
    href: "/admin/reportes",
    icon: <ReportIcon />,
  },
  {
    title: "Métricas",
    description: "Consulta el uso y la actividad de la plataforma.",
    href: "/admin/metricas",
    icon: <BarChart3 className="h-5 w-5" strokeWidth={1.5} />,
  },
];

export const gettingStartedSteps: GettingStartedStep[] = [
  {
    title: "Sube una plantilla maestra",
    description: "Carga el archivo de cálculo que usarán los reportes.",
    href: "/admin/master/plantillas",
    cta: "Ir a plantillas",
  },
  {
    title: "Crea una portada",
    description: "Diseña la presentación que acompañará tus reportes.",
    href: "/admin/portadas/nuevo",
    cta: "Nueva portada",
  },
  {
    title: "Genera un reporte",
    description: "Combina portada y plantilla para publicar un reporte.",
    href: "/admin/reportes/nuevo",
    cta: "Nuevo reporte",
  },
];
