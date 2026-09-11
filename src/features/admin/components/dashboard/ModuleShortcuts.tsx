import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { dashboardModules } from "./dashboard.data";

const STAGGER_MS = [0, 75, 150, 225];

const moduleColors: Record<string, { bg: string; hover: string; icon: string }> = {
  "Plantillas Maestras": { bg: "bg-blue-50", hover: "group-hover:bg-blue-100", icon: "text-blue-600" },
  "Portadas": { bg: "bg-emerald-50", hover: "group-hover:bg-emerald-100", icon: "text-emerald-600" },
  "Reportes": { bg: "bg-violet-50", hover: "group-hover:bg-violet-100", icon: "text-violet-600" },
  "Métricas": { bg: "bg-amber-50", hover: "group-hover:bg-amber-100", icon: "text-amber-600" },
};

export function ModuleShortcuts() {
  return (
    <section aria-label="Accesos directos a módulos">
      <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
        Accesos directos
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardModules.map((module, index) => {
          const colors = moduleColors[module.title] ?? { bg: "bg-blue-50", hover: "group-hover:bg-blue-100", icon: "text-blue-600" };
          return (
            <Link
              key={module.href}
              to={module.href}
              style={{
                animationDelay: `${STAGGER_MS[index] ?? 0}ms`,
                animationFillMode: "backwards",
              }}
              className="group relative flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 ease-out animate-in fade-in zoom-in-95 hover:border-blue-200 hover:shadow-md active:scale-[0.97]"
            >
              {/* Icon + arrow row */}
              <div className="flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg} ${colors.icon} transition-colors duration-200 ${colors.hover}`}>
                  {module.icon}
                </span>
                <ArrowRight
                  className="h-4 w-4 text-gray-300 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-blue-500"
                  strokeWidth={2}
                />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">
                  {module.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {module.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}