import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, BarChart2, Home, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import RichTextEditor from "@/shared/components/ui/TextEditor";
import { MainService } from "@/shared/services/main.service";
import type { Report, TemplateCodeBasic, Cover } from "@/shared/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportFormData {
  nombre: string;
  activo: boolean;
  precio: number;
  moneda: string;
  sectorEmpresa: string;
  bonoAjustado: string;
  contenido: string;
  linkPago: string;
  portadaId: number | null;
}

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const INITIAL_FORM: ReportFormData = {
  nombre: "",
  activo: true,
  precio: 0,
  moneda: "SOLES",
  sectorEmpresa: "",
  bonoAjustado: "",
  contenido: "",
  linkPago: "",
  portadaId: null,
};

const DEFAULT_CONTENT = `<h2 style="text-align: left"><strong>1. INTRODUCCIÓN</strong></h2>
<p style="text-align: justify">El presente reporte contiene los resultados de la estimación del costo de capital de la empresa, además de una explicación de la metodología utilizada. El proceso de estimación tiene tres etapas. Primero, se realiza una estimación del costo de capital en un mercado desarrollado en base al sector al que pertenece la empresa. Segundo, se ajusta dicha estimación para reflejar el riesgo del país en el que opera principalmente la empresa. Y tercero, se realiza un conjunto de ajustes finales para reflejar el nivel de apalancamiento financiero de la empresa, la divisa en la que quiere expresarse la tasa, y otros riesgos que pueda enfrentar la empresa.</p>
<p style="text-align: justify">A continuación, se describe en detalle estas tres etapas, mostrando los resultados obtenidos en cada caso.</p>
<h2 style="text-align: left"><strong>2. COSTO DE CAPITAL EN UN MERCADO DESARROLLADO</strong></h2>
<p style="text-align: justify">La primera etapa consiste en estimar el costo de capital en un mercado desarrollado de referencia. La característica de "desarrollado" se refiere al nivel de liquidez, representatividad, e historial estadístico de sus mercados bursátiles. Esto es sumamente importante, pues la información obtenida de los mercados bursátiles es la base para una correcta estimación.</p>`;

function reportToForm(report: Report): ReportFormData {
  return {
    nombre: report.nombre,
    activo: report.activo,
    precio: report.precio ?? 0,
    moneda: report.moneda,
    sectorEmpresa: report.sector_empresa ?? "",
    bonoAjustado: report.bono_ajustado ?? "",
    contenido: report.contenido ?? "",
    linkPago: report.link_pago ?? "",
    portadaId: report.portada?.id ?? null,
  };
}

const FieldItem: React.FC<{ field: TemplateCodeBasic }> = ({ field }) => (
  <div
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData("text/plain", field.code);
      e.dataTransfer.effectAllowed = "copy";
    }}
    className="flex cursor-grab active:cursor-grabbing items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-all hover:border-blue-100 hover:bg-blue-50"
  >
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-100">
      <BarChart2 className="h-3.5 w-3.5 text-blue-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate font-mono text-[11px] font-semibold text-blue-500">
        {field.code}
      </p>
      <p className="truncate text-xs font-medium text-slate-700">{field.nombre}</p>
      <p className="truncate text-[10px] text-slate-400">{field.hoja ?? "—"}</p>
    </div>
  </div>
);

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
      >
        <span className="text-xs font-semibold text-slate-700">{title}</span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>
      {open && (
        <>
          <Separator />
          <div className="p-2">{children}</div>
        </>
      )}
    </div>
  );
};

export const ReporteKapitalEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);


  const [editorKey, setEditorKey] = useState(0);
  const [editorContent, setEditorContent] = useState<string>("");
  const [contentReady, setContentReady] = useState(false); 

  const [form, setForm] = useState<ReportFormData>(INITIAL_FORM);
  const [report, setReport] = useState<Report | null>(null);
  const [covers, setCovers] = useState<Cover[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [info, setInfo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const templateCodes = report?.template?.template_codes ?? [];
  const portadaUrl = report?.portada?.portada?.url;

  const isChartOrTable = (tc: TemplateCodeBasic) => {
    const text = `${tc.nombre} ${tc.code}`.toLowerCase();
    return (
      text.includes("grafico") ||
      text.includes("gráfico") ||
      text.includes("tabla")
    );
  };

  const chartsAndTables = templateCodes.filter(isChartOrTable);
  const fields = templateCodes.filter((tc) => !isChartOrTable(tc));

  // Load covers list
  useEffect(() => {
    MainService.getCovers().then(setCovers);
  }, []);

  useEffect(() => {
    if (!id) {
      setContentReady(true);
      return;
    }

    setLoading(true);

    MainService.getReport(Number(id))
      .then(async (r) => {
        setReport(r);
        setForm(reportToForm(r));

        if (r.file) {
          try {
            const html = await MainService.getReportContent(Number(id));
            setEditorContent(html || DEFAULT_CONTENT);
          } catch {
            setEditorContent(DEFAULT_CONTENT);
          }
        } else {
          setEditorContent(DEFAULT_CONTENT);
        }

        setEditorKey((k) => k + 1);
        setContentReady(true);
      })
      .catch(() => setError("No se pudo cargar el reporte."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = <K extends keyof ReportFormData>(
    key: K,
    value: ReportFormData[K]
  ): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);

    try {
      await MainService.updateReport(Number(id), {
        nombre: form.nombre,
        precio: form.precio,
        moneda: form.moneda,
        sector_empresa: form.sectorEmpresa,
        bono_ajustado: form.bonoAjustado,
        contenido: form.contenido,
        link_pago: form.linkPago,
        activo: form.activo,
        portada_id: form.portadaId
      });

      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const element = document.createElement("div");
      element.style.cssText = [
        "width:794px",
        "padding:40px",
        "background:white",
        "font-family:sans-serif",
        "position:absolute",
        "top:-9999px",
        "left:0",
      ].join(";");
      element.innerHTML = editorContent;
      document.body.appendChild(element);

      await new Promise<void>((res) => requestAnimationFrame(() => res()));

      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      document.body.removeChild(element);

      const pdf = new jsPDF({ unit: "px", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let y = 0;
      while (y < imgHeight) {
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.95),
          "JPEG",
          0,
          -y,
          imgWidth,
          imgHeight
        );
        y += pageHeight;
        if (y < imgHeight) pdf.addPage();
      }

      const blob = pdf.output("blob");
      const formData = new FormData();
      formData.append("file", blob, `Reporte-${id}.pdf`);
      formData.append("html", editorContent);

      await MainService.uploadReportFile(Number(id), formData);

      navigate("/admin/kapital/reportes");
    } catch (err) {
      console.error(err);
      alert("Error al guardar el reporte. Revisa la consola para más detalles.");
    } finally {
      setSaving(false);
    }
  };

  // ── Early returns ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-gray-400">
        Cargando reporte...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Lightbox */}
      {lightboxOpen && portadaUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={"/images/prueba_portada.jpg"}
            alt={"prueba"}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20 transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Top header */}
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <h1 className="text-xs font-bold tracking-widest text-slate-800 uppercase">
          Gestión de Reportes de Kapital
        </h1>
      </header>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-4 py-3 text-[10px] text-slate-500 md:px-6">
        <Home className="h-3 w-3" />
        <span>Home</span>
        <ChevronRight className="h-3 w-3" />
        <button
          type="button"
          className="hover:underline"
          onClick={() => navigate("/admin/kapital/reportes")}
        >
          Reportes
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-slate-700">
          {isEdit ? form.nombre || "Editar reporte" : "Nuevo reporte"}
        </span>
      </div>

      <div className="mx-4 mb-10 md:mx-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Card header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <h2 className="text-[11px] font-bold tracking-widest text-blue-600 uppercase">
            {isEdit ? "Editar diseño de reporte" : "Nuevo reporte"}
          </h2>
        </div>

        <div className="flex flex-col gap-6 p-6 lg:flex-row">
          {/* ── Main column ── */}
          <div className="flex flex-1 flex-col gap-5 min-w-0">
            {/* Form fields */}
            <div className="p-2">
              {/* Nombre + Activo */}
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Label
                    htmlFor="nombre"
                    className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase"
                  >
                    Nombre
                  </Label>
                  <Input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    placeholder="Nombre del reporte..."
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 pb-1">
                  <Checkbox
                    id="activo"
                    checked={form.activo}
                    onCheckedChange={(v) => handleChange("activo", Boolean(v))}
                    className="border-blue-400 data-[state=checked]:bg-blue-500"
                  />
                  <Label
                    htmlFor="activo"
                    className="cursor-pointer text-xs font-semibold text-slate-600"
                  >
                    Activar
                  </Label>
                </div>
              </div>

              {/* Precio / Moneda / Sector / Bono */}
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(
                  [
                    {
                      id: "precio",
                      label: "Precio",
                      type: "number",
                      key: "precio" as const,
                    },
                    {
                      id: "moneda",
                      label: "Moneda",
                      type: "text",
                      key: "moneda" as const,
                    },
                    {
                      id: "sector",
                      label: "Sector / Empresa",
                      type: "text",
                      key: "sectorEmpresa" as const,
                    },
                    {
                      id: "bono",
                      label: "Bono / Ajustado",
                      type: "text",
                      key: "bonoAjustado" as const,
                    },
                  ] as const
                ).map(({ id: fieldId, label, type, key }) => (
                  <div key={fieldId}>
                    <Label
                      htmlFor={fieldId}
                      className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase"
                    >
                      {label}
                    </Label>
                    <Input
                      id={fieldId}
                      type={type}
                      value={form[key] as string | number}
                      onChange={(e) =>
                        handleChange(
                          key,
                          type === "number"
                            ? Number(e.target.value)
                            : e.target.value
                        )
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                ))}
              </div>

              {/* Contenido + Link de pago */}
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="w-full sm:w-1/4">
                  <Label
                    htmlFor="contenido"
                    className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase"
                  >
                    Contenido
                  </Label>
                  <Input
                    id="contenido"
                    value={form.contenido}
                    onChange={(e) => handleChange("contenido", e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="linkPago"
                    className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase"
                  >
                    Link de pago
                  </Label>
                  <Input
                    id="linkPago"
                    value={form.linkPago}
                    onChange={(e) => handleChange("linkPago", e.target.value)}
                    placeholder="https://..."
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Portada selector */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex-1">
                  <Label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase">
                    Portada
                  </Label>
                  <Select
                    value={form.portadaId ? String(form.portadaId) : ""}
                    onValueChange={(v) =>
                      handleChange("portadaId", v ? Number(v) : null)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Sin portada asignada" />
                    </SelectTrigger>
                    <SelectContent>
                      {covers.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={String(c.id)}
                          className="text-sm"
                        >
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cover thumbnail */}
                <div
                  className="relative flex h-24 w-16 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-blue-200 shadow-sm bg-gradient-to-br from-blue-600 to-blue-800"
                  onClick={() => portadaUrl && setLightboxOpen(true)}
                >
                  {portadaUrl ? (
                    <img
                      src={"/images/prueba_portada.jpg"}
                      alt={"prueba"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <BarChart2 className="mx-auto h-4 w-4 text-blue-200" />
                      <p className="mt-0.5 text-[8px] font-bold leading-tight text-blue-100 uppercase">
                        KAPITAL
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info panel */}
            <div className="rounded-xl border border-violet-200 bg-violet-50">
              <button
                type="button"
                onClick={() => setInfo((p) => !p)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left"
              >
                <span className="text-[10px] font-semibold text-violet-600 uppercase tracking-wide">
                  Info
                </span>
                {info ? (
                  <ChevronUp className="h-3.5 w-3.5 text-violet-400" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-violet-400" />
                )}
              </button>
              {info && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 px-4 py-1">
                  <div className="space-y-3 sm:col-span-1">
                    <div className="flex flex-col items-start gap-1">
                      <code className="rounded bg-violet-100 px-1 py-0.5 font-mono text-[12px] font-semibold text-violet-700 whitespace-nowrap">
                        $BLOQUE_INICIO$
                      </code>
                      <p className="text-[10px] font-medium text-violet-600">
                        Inicia una fila de columnas
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <code className="rounded bg-violet-100 px-1 py-0.5 font-mono text-[12px] font-semibold text-violet-700 whitespace-nowrap">
                        $BLOQUE_FIN$
                      </code>
                      <p className="text-[10px] font-medium text-violet-600">
                        Cierra la fila iniciada
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <div>
                      <p className="text-[10px] text-violet-600 leading-relaxed font-bold">
                        Para insertar estilos y clases a un elemento ingresado
                        debe de seguir estos patrones como ejemplo:
                      </p>
                      <p className="font-mono text-[10px] text-violet-500 mt-1">
                        $$W6OMQ$$[*height:350px;][.col-6]
                      </p>
                      <p className="text-[10px] text-violet-400 mt-0.5">
                        Estilos: [*height:350px;*width:50%;]
                      </p>
                      <p className="text-[10px] text-violet-400">
                        Clases: [.col-2.col-3.col-4] `{"{"}"={">"}"` [1|2|3|4|5|6|7|8|9|10|11|12]`
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-violet-400 mt-0.5">
                        Las clases que contengan{" "}
                        <code className="rounded bg-violet-100 px-0.5 font-mono text-violet-700">
                          col
                        </code>{" "}
                        se comportarán como columnas si están dentro de un bloque.
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-violet-600 leading-relaxed">
                        Para la edición de textos se debe ingresar dentro de estas
                        llaves:
                      </p>
                      <p className="font-bold text-[10px] text-violet-500 mt-1">
                        {"{"}{"= hola ="}{"}"} o {"{"}{"= hola ="}{"}"}{" "}
                        {"[.col-6]"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>


            {!contentReady ? (
              <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-sm text-gray-400">
                Cargando contenido del reporte...
              </div>
            ) : (
              <RichTextEditor
                key={editorKey}
                initialContent={editorContent || DEFAULT_CONTENT}
                onChange={setEditorContent}
              />
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-sm h-9 px-4"
                onClick={() => navigate("/admin/kapital/reportes")}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 text-sm h-9 px-4 text-white hover:bg-blue-700"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar reporte"}
              </Button>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <p className="mb-3 text-[14px] font-bold tracking-widest text-slate-700 uppercase">
              Estructura de Tablas y Gráficos
            </p>
            <div className="flex flex-col gap-3">
              <CollapsiblePanel title="Campos" defaultOpen>
                {fields.length > 0 ? (
                  <div className="space-y-1">
                    {fields.map((tc) => (
                      <FieldItem key={tc.id} field={tc} />
                    ))}
                  </div>
                ) : (
                  <p className="px-3 py-4 text-center text-[10px] text-slate-400">
                    Sin campos en la plantilla.
                  </p>
                )}
              </CollapsiblePanel>

              <CollapsiblePanel title="Tablas / Gráficos" defaultOpen={false}>
                {chartsAndTables.length > 0 ? (
                  <div className="space-y-1">
                    {chartsAndTables.map((tc) => (
                      <FieldItem key={tc.id} field={tc} />
                    ))}
                  </div>
                ) : (
                  <p className="px-3 py-4 text-center text-[10px] text-slate-400">
                    Sin elementos configurados.
                  </p>
                )}
              </CollapsiblePanel>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ReporteKapitalEditor;