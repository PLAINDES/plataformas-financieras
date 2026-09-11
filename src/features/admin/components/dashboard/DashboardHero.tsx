import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, FileText, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";

export function DashboardHero() {
  const { user } = useAuthContext();

  if (!user) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="grid md:grid-cols-5">
        {/* Texto */}
        <div className="p-6 md:col-span-3 md:p-9">
          <p className="text-[11px] font-bold tracking-widest text-blue-600 uppercase">
            Panel principal
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
            Bienvenido, {user.name}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500">
            Desde aquí gestionas las portadas, las plantillas maestras y los
            reportes de la plataforma. Elige un módulo para empezar o revisa
            las métricas de actividad.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="bg-blue-600 font-bold shadow-lg shadow-blue-200 transition-[background-color,box-shadow,transform] hover:bg-blue-700 active:scale-[0.96]"
            >
              <Link to="/">
                Salir al sitio
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="font-bold transition-[background-color,border-color,color,box-shadow] active:scale-[0.96]"
            >
              <Link to="/admin/metricas">Ver métricas</Link>
            </Button>
          </div>

          {/* Stats mini */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Layers className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <p className="text-xs text-gray-400">Plantillas</p>
                <p className="text-sm font-bold text-gray-900">Activas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <FileText className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <p className="text-xs text-gray-400">Portadas</p>
                <p className="text-sm font-bold text-gray-900">Listas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <BarChart3 className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <p className="text-xs text-gray-400">Reportes</p>
                <p className="text-sm font-bold text-gray-900">Publicados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Imagen hero */}
        <div className="hidden items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-violet-50 p-6 md:flex md:col-span-2">
          <img
            src="/images/Big Shoes - Hero.png"
            alt="Ilustración de bienvenida"
            className="h-auto w-full max-w-[260px] object-contain drop-shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}