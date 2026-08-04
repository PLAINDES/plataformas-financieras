import React, { useEffect, useRef, useState } from "react";
import { AnalyticsService } from "@shared/services/analytics.service";
import type { DashboardData } from "@shared/services/analytics.service";
import { Tooltip } from "@shared/components/common/Tooltip";
import * as XLSX from "xlsx";
import {
  Users,
  Eye,
  MousePointerClick,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Calendar,
  TrendingUp,
  MapPin,
  BarChart3,
  Activity,
  PlayCircle,
  CheckCircle2,
  Percent,
  UserPlus,
  RefreshCw,
  HelpCircle,
  Download,
} from "lucide-react";

declare global {
  interface Window {
    am4core: any;
    am4charts: any;
    am4themes_animated: any;
  }
}

const daysOptions = [
  { label: "7 días", value: 7 },
  { label: "30 días", value: 30 },
  { label: "90 días", value: 90 },
];

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  tooltip?: string;
}> = ({ title, value, icon, subtitle, tooltip }) => (
  <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {tooltip && (
            <Tooltip id={`tooltip-${title}`} content={tooltip}>
              <HelpCircle className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700 cursor-help transition-colors" />
            </Tooltip>
          )}
        </div>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>
    </div>
  </div>
);

const ProgressBar: React.FC<{ label: string; count: number; percentage: number; color?: string }> = ({
  label,
  count,
  percentage,
  color = "bg-blue-500",
}) => (
  <div className="mb-3 min-w-0">
    <div className="mb-1 flex min-w-0 items-center gap-2 text-sm">
      <span className="min-w-0 flex-1 truncate font-medium text-gray-700" title={label}>{label}</span>
      <span className="shrink-0 text-gray-500">
        {count} ({percentage}%)
      </span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
    </div>
  </div>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode; tooltip?: string }> = ({
  title,
  children,
  icon,
  tooltip,
}) => (
  <div className="min-w-0 rounded-xl bg-white p-5 shadow-sm border border-gray-100">
    <div className="mb-4 flex items-center gap-2">
      {icon && <span className="text-gray-500">{icon}</span>}
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
      {tooltip && (
        <Tooltip id={`tooltip-${title}`} content={tooltip}>
          <HelpCircle className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700 cursor-help transition-colors" />
        </Tooltip>
      )}
    </div>
    {children}
  </div>
);

const SessionsChart: React.FC<{ data: { date: string; count: number }[] }> = ({ data }) => {
  const chartDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartDiv.current || !window.am4core || data.length === 0) return;

    const chart = window.am4core.create(chartDiv.current, window.am4charts.XYChart);
    chart.paddingRight = 20;

    const dateAxis = chart.xAxes.push(new window.am4charts.DateAxis());
    dateAxis.renderer.labels.template.rotation = -45;
    dateAxis.renderer.labels.template.verticalCenter = "middle";
    dateAxis.renderer.labels.template.horizontalCenter = "right";
    dateAxis.tooltipDateFormat = "yyyy-MM-dd";

    const valueAxis = chart.yAxes.push(new window.am4charts.ValueAxis());
    valueAxis.min = 0;

    const series = chart.series.push(new window.am4charts.LineSeries());
    series.dataFields.dateX = "date";
    series.dataFields.valueY = "count";
    series.strokeWidth = 3;
    series.stroke = window.am4core.color("#3699FF");
    series.fill = window.am4core.color("#3699FF");
    series.fillOpacity = 0.15;
    series.tensionX = 0.8;
    series.tooltipText = "{date}: {count} sesiones";

    const bullet = series.bullets.push(new window.am4charts.CircleBullet());
    bullet.circle.radius = 4;
    bullet.circle.fill = window.am4core.color("#3699FF");
    bullet.circle.stroke = window.am4core.color("#fff");
    bullet.circle.strokeWidth = 2;

    chart.cursor = new window.am4charts.XYCursor();
    chart.cursor.lineY.disabled = true;

    chart.data = data.map((d) => ({
      date: d.date,
      count: d.count,
    }));

    return () => {
      chart.dispose();
    };
  }, [data]);

  return <div ref={chartDiv} style={{ width: "100%", height: "300px" }} />;
};

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [activeSessions, setActiveSessions] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const result = await AnalyticsService.getDashboard(days);
        setData(result);
        setError(null);
      } catch (e: any) {
        setError(e.message || "Error cargando métricas");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [days]);

  // Fetch sesiones activas cada 30 segundos
  useEffect(() => {
    const fetchActive = async () => {
      try {
        const result = await AnalyticsService.getActiveSessions();
        setActiveSessions(result.active_sessions);
      } catch {
        // Silenciar
      }
    };
    fetchActive();
    const interval = setInterval(fetchActive, 30000);
    return () => clearInterval(interval);
  }, []);

  const deviceIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("mobile")) return <Smartphone className="h-4 w-4" />;
    if (t.includes("tablet")) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const deviceColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("mobile")) return "bg-emerald-500";
    if (t.includes("tablet")) return "bg-amber-500";
    return "bg-blue-500";
  };

  const exportToExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    // 1. Resumen / KPIs
    const summaryData = [
      { Métrica: "Sesiones Totales", Valor: data.summary.total_sessions },
      { Métrica: "Páginas Vistas", Valor: data.summary.total_page_views },
      { Métrica: "Visitantes Únicos", Valor: data.summary.unique_visitors },
      { Métrica: "Sesiones Activas", Valor: data.summary.active_sessions },
      { Métrica: "Eventos Totales", Valor: data.summary.total_events },
      { Métrica: "Visitantes que inician Kapital", Valor: data.kapital_funnel?.users_started ?? 0 },
      { Métrica: "Tasa de activación Kapital (%)", Valor: data.kapital_funnel?.activation_rate ?? 0 },
      { Métrica: "Cálculos Kapital iniciados", Valor: data.kapital_funnel?.started ?? 0 },
      { Métrica: "Cálculos Kapital completados", Valor: data.kapital_funnel?.completed ?? 0 },
      { Métrica: "Tasa de finalización Kapital (%)", Valor: data.kapital_funnel?.completion_rate ?? 0 },
      { Métrica: "Visitantes nuevos en Kapital", Valor: data.kapital_retention?.new_users ?? 0 },
      { Métrica: "Visitantes recurrentes en Kapital", Valor: data.kapital_retention?.recurring_users ?? 0 },
      { Métrica: "Captaciones WhatsApp (CTA)", Valor: data.cta_clicks },
      { Métrica: "Duración Promedio Sesión (s)", Valor: data.summary.avg_duration_seconds ?? 0 },
      { Métrica: "Tiempo Promedio en Página (s)", Valor: data.avg_time_on_page ?? 0 },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen KPI");

    // 2. Dispositivos
    const devicesData = data.devices.map((d) => ({ Dispositivo: d.label, Cantidad: d.count, Porcentaje: `${d.percentage}%` }));
    const wsDevices = XLSX.utils.json_to_sheet(devicesData);
    XLSX.utils.book_append_sheet(wb, wsDevices, "Dispositivos");

    // 3. Ciudades
    const citiesData = data.cities.map((c) => ({ Ciudad: c.label, Cantidad: c.count, Porcentaje: `${c.percentage}%` }));
    const wsCities = XLSX.utils.json_to_sheet(citiesData);
    XLSX.utils.book_append_sheet(wb, wsCities, "Ciudades");

    // 4. Navegadores
    const browsersData = data.browsers.map((b) => ({ Navegador: b.label === "Unknown" ? "Otro / no identificado" : b.label, Cantidad: b.count, Porcentaje: `${b.percentage}%` }));
    const wsBrowsers = XLSX.utils.json_to_sheet(browsersData);
    XLSX.utils.book_append_sheet(wb, wsBrowsers, "Navegadores");

    // 5. Páginas más vistas
    const pagesData = data.pages.map((p) => ({ Página: p.label, Vistas: p.count, Porcentaje: `${p.percentage}%` }));
    const wsPages = XLSX.utils.json_to_sheet(pagesData);
    XLSX.utils.book_append_sheet(wb, wsPages, "Páginas Más Vistas");

    // 6. Distribución por hora
    const hourlyData = data.hourly_distribution.map((h) => ({ Hora: h.label, Cantidad: h.count, Porcentaje: `${h.percentage}%` }));
    const wsHourly = XLSX.utils.json_to_sheet(hourlyData);
    XLSX.utils.book_append_sheet(wb, wsHourly, "Por Hora");

    // 7. Distribución por día
    const dailyData = data.daily_distribution.map((d) => ({ Día: d.label, Cantidad: d.count, Porcentaje: `${d.percentage}%` }));
    const wsDaily = XLSX.utils.json_to_sheet(dailyData);
    XLSX.utils.book_append_sheet(wb, wsDaily, "Por Día");

    // 8. Sesiones en el tiempo
    const timeData = data.sessions_over_time.map((s) => ({ Fecha: s.date, Sesiones: s.count }));
    const wsTime = XLSX.utils.json_to_sheet(timeData);
    XLSX.utils.book_append_sheet(wb, wsTime, "Evolución Temporal");

    XLSX.writeFile(wb, `Metricas_Usuario_${days}dias.xlsx`);
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6 flex justify-between items-center">
        <div>
          <h1 className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-800 uppercase">
            Métricas de Usuario
          </h1>
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">
            Dashboard de analytics y comportamiento de usuarios.
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            disabled={!data}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
          <div className="flex gap-2">
            {daysOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  days === opt.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 py-5 md:py-8">
        <div className="container mx-auto px-4">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">
              Error: {error}
            </div>
          )}

          {!loading && data && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <MetricCard
                  title="Sesiones Activas"
                  value={activeSessions}
                  icon={<Activity className="h-5 w-5 text-emerald-600" />}
                  subtitle="En los últimos 15 min"
                  tooltip="Cantidad de usuarios que están navegando en este momento. Se considera activa una sesión que no ha cerrado la pestaña en los últimos 15 minutos."
                />
                <MetricCard
                  title="Total Sesiones"
                  value={data.summary.total_sessions}
                  icon={<Users className="h-5 w-5" />}
                  subtitle={`${data.summary.unique_visitors} visitantes únicos`}
                  tooltip="Número total de visitas realizadas en el periodo seleccionado. Un usuario puede generar múltiples sesiones si entra varias veces."
                />
                <MetricCard
                  title="Páginas Vistas"
                  value={data.summary.total_page_views}
                  icon={<Eye className="h-5 w-5" />}
                  tooltip="Cantidad total de páginas cargadas. Incluye recargas y navegación entre /kapital y el landing."
                />
                <MetricCard
                  title="Captación WhatsApp"
                  value={data.cta_clicks}
                  icon={<MousePointerClick className="h-5 w-5" />}
                  subtitle="Clics a links de WhatsApp"
                  tooltip="Número de veces que los usuarios hicieron clic en botones de WhatsApp (CTA, productos, footer o chat flotante)."
                />
                <MetricCard
                  title="Tiempo Promedio"
                  value={data.summary.avg_duration_seconds !== null && data.summary.avg_duration_seconds > 0
                    ? `${data.summary.avg_duration_seconds}s`
                    : `${data.avg_time_on_page ?? 0}s`}
                  icon={<Clock className="h-5 w-5" />}
                  subtitle="Duración promedio por sesión"
                  tooltip="Tiempo medio que un usuario permanece en el sitio por sesión. Si no hay sesiones cerradas, muestra el tiempo promedio en página."
                />
              </div>

              <section className="space-y-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    Embudo de Kapital
                  </h2>
                  <p className="text-xs text-gray-500">
                    Uso efectivo de la calculadora en el periodo seleccionado.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <MetricCard
                    title="Visitantes que inician"
                    value={data.kapital_funnel?.users_started ?? 0}
                    icon={<Users className="h-5 w-5" />}
                    subtitle="Primera interacción manual"
                    tooltip="Visitantes únicos, identificados por cuenta o IP, que modificaron al menos un campo de la calculadora Kapital en el periodo seleccionado."
                  />
                  <MetricCard
                    title="Tasa de activación"
                    value={`${data.kapital_funnel?.activation_rate ?? 0}%`}
                    icon={<Percent className="h-5 w-5 text-cyan-600" />}
                    subtitle="Iniciaron entre visitantes"
                    tooltip="Porcentaje de visitantes únicos que modificaron al menos un campo respecto de quienes visitaron Kapital."
                  />
                  <MetricCard
                    title="Cálculos iniciados"
                    value={data.kapital_funnel?.started ?? 0}
                    icon={<PlayCircle className="h-5 w-5" />}
                    subtitle="Intentos iniciales validados"
                    tooltip="Cantidad de cálculos iniciales de Kapital enviados después de completar los campos obligatorios. No incluye sensibilizaciones."
                  />
                  <MetricCard
                    title="Cálculos completados"
                    value={data.kapital_funnel?.completed ?? 0}
                    icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    subtitle="Sensibilizaciones realizadas"
                    tooltip="Cantidad de cálculos iniciales que alcanzaron una sensibilización procesada correctamente."
                  />
                  <MetricCard
                    title="Tasa de finalización"
                    value={`${data.kapital_funnel?.completion_rate ?? 0}%`}
                    icon={<Percent className="h-5 w-5 text-amber-600" />}
                    subtitle="Completados entre iniciados"
                    tooltip="Porcentaje de cálculos iniciados que alcanzaron una sensibilización procesada correctamente."
                  />
                </div>
              </section>

              <section className="space-y-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    Retención de Kapital
                  </h2>
                  <p className="text-xs text-gray-500">
                    Personas identificadas por su cuenta o IP que llegan por primera vez o regresan a Kapital.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <MetricCard
                    title="Visitantes nuevos"
                    value={data.kapital_retention?.new_users ?? 0}
                    icon={<UserPlus className="h-5 w-5 text-blue-600" />}
                    subtitle="Primera visita a Kapital"
                    tooltip="Cuentas o direcciones IP cuya primera visita histórica a Kapital ocurrió dentro del periodo seleccionado."
                  />
                  <MetricCard
                    title="Visitantes recurrentes"
                    value={data.kapital_retention?.recurring_users ?? 0}
                    icon={<RefreshCw className="h-5 w-5 text-emerald-600" />}
                    subtitle="Regresaron durante el periodo"
                    tooltip="Cuentas o direcciones IP que visitaron Kapital en el periodo seleccionado y ya tenían una visita anterior."
                  />
                </div>
              </section>

              {/* Chart + Tables */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Chart */}
                <div className="lg:col-span-2">
                  <SectionCard title="Sesiones en el tiempo" icon={<TrendingUp className="h-4 w-4" />} tooltip="Evolución diaria del tráfico en el periodo seleccionado. Permite identificar picos de actividad y tendencias de crecimiento.">
                    <SessionsChart data={data.sessions_over_time} />
                  </SectionCard>
                </div>

                {/* Devices */}
                <SectionCard title="Dispositivos" icon={<Monitor className="h-4 w-4" />} tooltip="Distribución del tráfico según el tipo de dispositivo (desktop, mobile, tablet).">
                  {data.devices.length === 0 ? (
                    <p className="text-sm text-gray-400">Sin datos</p>
                  ) : (
                    data.devices.map((d) => (
                      <div key={d.label} className="mb-3 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                          {deviceIcon(d.label)}
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700 capitalize">{d.label}</span>
                            <span className="text-gray-500">{d.count}</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full ${deviceColor(d.label)}`}
                              style={{ width: `${Math.min(d.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </SectionCard>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Cities */}
                <SectionCard title="Ciudades principales" icon={<MapPin className="h-4 w-4" />} tooltip="Top 10 ciudades desde donde acceden los usuarios. Se obtiene mediante la IP del visitante.">
                  {data.cities.length === 0 ? (
                    <p className="text-sm text-gray-400">Sin datos de geolocalización</p>
                  ) : (
                    data.cities.map((c) => (
                      <ProgressBar key={c.label} label={c.label} count={c.count} percentage={c.percentage} color="bg-indigo-500" />
                    ))
                  )}
                </SectionCard>

                {/* Browsers */}
                <SectionCard title="Navegadores" icon={<Globe className="h-4 w-4" />} tooltip="Desglose de navegadores usados por los visitantes.">
                  {data.browsers.map((b) => (
                    <ProgressBar key={b.label} label={b.label === "Unknown" ? "Otro / no identificado" : b.label} count={b.count} percentage={b.percentage} color="bg-cyan-500" />
                  ))}
                </SectionCard>

                {/* Pages */}
                <SectionCard title="Páginas más vistas" icon={<BarChart3 className="h-4 w-4" />} tooltip="Páginas con mayor cantidad de vistas. Muestra qué contenido atrae más tráfico (/kapital, landing, etc.).">
                  {data.pages.map((p) => (
                    <ProgressBar key={p.label} label={p.label} count={p.count} percentage={p.percentage} color="bg-violet-500" />
                  ))}
                </SectionCard>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Hourly */}
                <SectionCard title="Distribución por hora" icon={<Clock className="h-4 w-4" />} tooltip="Horas del día con mayor tráfico. Se agrupa por hora de inicio de sesión (hora de Lima, UTC-5).">
                  <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-12">
                    {data.hourly_distribution.map((h) => (
                      <div key={h.label} className="text-center">
                        <div className="mx-auto mb-1 flex h-16 w-full items-end justify-center rounded-md bg-gray-50 px-1">
                          <div
                            className="w-full rounded-sm bg-blue-500"
                            style={{ height: `${Math.max((h.count / Math.max(...data.hourly_distribution.map((d) => d.count), 1)) * 100, 4)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500">{h.label}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Daily */}
                <SectionCard title="Distribución por día" icon={<Calendar className="h-4 w-4" />} tooltip="Tráfico distribuido por día de la semana.">
                  <div className="grid grid-cols-7 gap-2">
                    {data.daily_distribution.map((d) => (
                      <div key={d.label} className="text-center">
                        <div className="mx-auto mb-1 flex h-16 w-full items-end justify-center rounded-md bg-gray-50 px-1">
                          <div
                            className="w-full rounded-sm bg-emerald-500"
                            style={{ height: `${Math.max((d.count / Math.max(...data.daily_distribution.map((d) => d.count), 1)) * 100, 4)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500">{d.label.slice(0, 3)}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AnalyticsPage;
