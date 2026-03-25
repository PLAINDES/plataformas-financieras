import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, BarChart2, Home } from "lucide-react";
import Breadcrumbs from "@/shared/components/Breadcrumbs";
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
  contentEditor: string;
  linkPago: string;
  portadaId: number | null;
  type: "valora" | "kapital";
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
  moneda: "",
  sectorEmpresa: "",
  bonoAjustado: "",
  contenido: "",
  contentEditor: "",
  linkPago: "",
  portadaId: null,
  type: "kapital",
};

const DEFAULT_CONTENT = "";

function reportToForm(report: Report): ReportFormData {
  return {
    nombre: report.nombre,
    activo: report.activo,
    precio: report.precio ?? 0,
    moneda: report.moneda,
    sectorEmpresa: report.sector_empresa ?? "",
    bonoAjustado: report.bono_ajustado ?? "",
    contenido: report.contenido ?? "",
    contentEditor: (report as any).contentEditor ?? "",
    linkPago: report.link_pago ?? "",
    portadaId: report.portada?.id ?? null,
    type: (report.type as "kapital" | "valora") ?? "kapital",
  };
}

const FieldItem: React.FC<{
  field: TemplateCodeBasic;
  largeImage?: boolean;
}> = ({ field, largeImage = false }) => (
  <div
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData("text/plain", field.code);
      e.dataTransfer.effectAllowed = "copy";
    }}
    className="flex cursor-grab active:cursor-grabbing items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-all hover:border-blue-100 hover:bg-blue-50"
  >
    {/** show thumbnail if available */}
    {((field as any).template_code_image_url as string) && (
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-blue-100 overflow-hidden">
        <img
          src={(field as any).template_code_image_url}
          alt={field.code}
          className="h-14 w-14 object-fill"
        />
      </div>
    )}
    <div className="min-w-0 flex-1">
      {largeImage ? (
        <div className="flex flex-col">
          <p className="truncate font-mono text-[10px] font-semibold text-blue-500">
            {field.code}
          </p>
          <p className="truncate text-[11px] font-bold text-slate-700">
            {field.nombre}
          </p>
          <p className="truncate text-[9px] text-slate-400">
            {field.hoja ?? "—"}
          </p>
        </div>
      ) : (
        <>
          <p className="truncate font-mono text-[11px] font-semibold text-blue-500">
            {field.code}
          </p>
          <p className="truncate text-xs font-medium text-slate-700">
            {field.nombre}
          </p>
          <p className="truncate text-[10px] text-slate-400">
            {field.hoja ?? "—"}
          </p>
        </>
      )}
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

  const [currentTemplateCodes, setCurrentTemplateCodes] = useState<
    TemplateCodeBasic[] | null
  >(null);
  const [codesLoading, setCodesLoading] = useState(false);
  const PAGE_SIZE = 5;
  const [fieldsPage, setFieldsPage] = useState(0);
  const [chartsPage, setChartsPage] = useState(0);
  const templateCodes =
    report?.template?.template_codes ?? currentTemplateCodes ?? [];
  const portadaUrl = report?.portada?.portada?.url;
  const selectedCover = form.portadaId
    ? covers.find((c) => c.id === form.portadaId)
    : undefined;
  const selectedCoverUrl = selectedCover?.portada?.url ?? portadaUrl ?? null;

  const breadcrumbItems = [
    {
      label: (
        <div className="flex items-center gap-1">
          <Home className="h-3 w-3" />
          <span className="ml-1">Home</span>
        </div>
      ),
    },
    { label: "Reportes", onClick: () => navigate("/admin/reportes") },
    { label: isEdit ? form.nombre || "Editar reporte" : "Nuevo reporte" },
  ];

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

  const [fieldsQuery, setFieldsQuery] = useState("");
  const [chartsQuery, setChartsQuery] = useState("");

  // pagination reset when template codes change
  useEffect(() => {
    setFieldsPage(0);
    setChartsPage(0);
  }, [templateCodes]);

  const filteredFields = fields.filter((f) => {
    if (!fieldsQuery) return true;
    const q = fieldsQuery.toLowerCase();
    return `${f.code} ${f.nombre}`.toLowerCase().includes(q);
  });

  const filteredCharts = chartsAndTables.filter((f) => {
    if (!chartsQuery) return true;
    const q = chartsQuery.toLowerCase();
    return `${f.code} ${f.nombre}`.toLowerCase().includes(q);
  });

  const fieldsVisible = filteredFields.slice(
    fieldsPage * PAGE_SIZE,
    (fieldsPage + 1) * PAGE_SIZE
  );
  const chartsVisible = filteredCharts.slice(
    chartsPage * PAGE_SIZE,
    (chartsPage + 1) * PAGE_SIZE
  );

  // Load covers list
  useEffect(() => {
    MainService.getCovers().then(setCovers);
  }, []);

  // Load current master template codes (fallback when report has no template)
  useEffect(() => {
    setCodesLoading(true);
    MainService.getCurrentMasterTemplateCodes()
      .then((res) => {
        const codes: TemplateCodeBasic[] = [];
        const grouped = res?.extracted_codes || {};
        ["kapital", "valora"].forEach((t) => {
          const list = grouped[t] || [];
          for (const item of list) {
            if (!item) continue;
            // item can be a string fallback or an object from backend
            if (typeof item === "string") {
              codes.push({
                id: -1,
                nombre: item,
                code: item,
                type: t as "kapital" | "valora",
                hoja: null,
              });
            } else if (item.code) {
              const nombre =
                item.nombre ?? item.original_name ?? item.filename ?? item.code;
              // preserve optional image url if backend provided it
              const entry: any = {
                id: item.id ?? -1,
                nombre,
                code: item.code,
                type: t as "kapital" | "valora",
                hoja: item.hoja ?? null,
              };
              if (item.template_code_image_url)
                entry.template_code_image_url = item.template_code_image_url;
              codes.push(entry);
            }
          }
        });
        setCurrentTemplateCodes(codes);
      })
      .catch(() => setCurrentTemplateCodes([]))
      .finally(() => setCodesLoading(false));
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
          // if backend already has editor content persisted on the report row, use it
          setEditorContent((r as any).contentEditor ?? DEFAULT_CONTENT);
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
    setSaving(true);

    try {
      let reportId = id ? Number(id) : undefined;

      if (!reportId) {
        // create new report first
        const created = await MainService.createReport({
          nombre: form.nombre,
          precio: form.precio,
          moneda: form.moneda,
          sector_empresa: form.sectorEmpresa,
          bono_ajustado: form.bonoAjustado,
          contenido: form.contenido,
          contentEditor: editorContent,
          link_pago: form.linkPago,
          activo: form.activo,
          portada_id: form.portadaId,
          type: form.type,
        });
        reportId = created.id;
      } else {
        await MainService.updateReport(Number(reportId), {
          nombre: form.nombre,
          precio: form.precio,
          moneda: form.moneda,
          sector_empresa: form.sectorEmpresa,
          bono_ajustado: form.bonoAjustado,
          contenido: form.contenido,
          contentEditor: editorContent,
          link_pago: form.linkPago,
          activo: form.activo,
          portada_id: form.portadaId,
          type: form.type,
        });
      }

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

      const sanitizeContent = (html: string) =>
        html
          // remove oklch(...) optionally followed by an alpha slash part
          .replace(/oklch\([^)]*\)(?:\/[^)\s;\"]*)?/gi, "#333333")
          // also handle oklab(...) just in case
          .replace(/oklab\([^)]*\)(?:\/[^)\s;\"]*)?/gi, "#333333");

      const sanitized = sanitizeContent(editorContent);

      // Render inside an isolated iframe so html2canvas doesn't parse global styles
      const iframe = document.createElement("iframe");
      iframe.style.cssText = [
        "width:794px",
        "height: auto",
        "position:absolute",
        "top:-9999px",
        "left:0",
        "border:0",
      ].join(";");
      document.body.appendChild(iframe);

      const idoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!idoc)
        throw new Error("Could not create iframe document for PDF rendering");

      const html = `<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>html,body{margin:0;padding:0;background:transparent} .__rk_wrapper{width:794px;padding:40px;background:white;font-family:sans-serif;box-sizing:border-box}</style></head><body><div class=\"__rk_wrapper\">${sanitized}</div></body></html>`;
      idoc.open();
      idoc.write(html);
      idoc.close();

      // wait a tick for iframe to render resources
      await new Promise<void>((res) => setTimeout(() => res(), 120));

      const target = idoc.querySelector(".__rk_wrapper") as HTMLElement;
      if (!target) throw new Error("Rendered content missing in iframe");

      const canvas = await html2canvas(target, { scale: 2, useCORS: true });
      document.body.removeChild(iframe);

      const pdf = new jsPDF({
        unit: "px",
        format: "a4",
        orientation: "portrait",
      });
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
      formData.append("file", blob, `Reporte-${reportId}.pdf`);
      formData.append("html", editorContent);

      await MainService.uploadReportFile(reportId!, formData);

      navigate("/admin/reportes");
    } catch (err: any) {
      console.error("Error en handleSave:", err);
      try {
        if (err && err.message) console.error("message:", err.message);
        if (err && err.stack) console.error("stack:", err.stack);
        // attempt to stringify if it's a plain object
        if (typeof err === "object")
          console.error("error object:", JSON.stringify(err));
      } catch (e) {
        // ignore stringify errors
      }
      alert(
        "Error al guardar el reporte. Revisa la consola para más detalles."
      );
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
      {lightboxOpen && selectedCoverUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={selectedCoverUrl!}
            alt={"portada"}
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
      <Breadcrumbs
        items={breadcrumbItems}
        className="flex items-center gap-1 px-4 py-3 text-[10px] text-slate-500 md:px-6"
      />

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
                <div className="sm:w-48">
                  <Label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase">
                    Tipo
                  </Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      handleChange("type", v as "kapital" | "valora")
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kapital">Kapital</SelectItem>
                      <SelectItem value="valora">Valora</SelectItem>
                    </SelectContent>
                  </Select>
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
                  onClick={() => selectedCoverUrl && setLightboxOpen(true)}
                >
                  {selectedCoverUrl ? (
                    <img
                      src={selectedCoverUrl}
                      alt={"portada"}
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
                        Clases: [.col-2.col-3.col-4] `{"{"}"={">"}"`
                        [1|2|3|4|5|6|7|8|9|10|11|12]`
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-violet-400 mt-0.5">
                        Las clases que contengan{" "}
                        <code className="rounded bg-violet-100 px-0.5 font-mono text-violet-700">
                          col
                        </code>{" "}
                        se comportarán como columnas si están dentro de un
                        bloque.
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-violet-600 leading-relaxed">
                        Para la edición de textos se debe ingresar dentro de
                        estas llaves:
                      </p>
                      <p className="font-bold text-[10px] text-violet-500 mt-1">
                        {"{"}
                        {"= hola ="}
                        {"}"} o {"{"}
                        {"= hola ="}
                        {"}"} {"[.col-6]"}
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
                onClick={() => navigate("/admin/reportes")}
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
                <div className="px-2 pb-2">
                  <Input
                    value={fieldsQuery}
                    onChange={(e) => setFieldsQuery(e.target.value)}
                    placeholder="Buscar por código o nombre..."
                    className="h-10 text-sm"
                  />
                </div>
                {codesLoading ? (
                  <div className="flex items-center justify-center p-6 text-sm text-slate-400">
                    Cargando...
                  </div>
                ) : filteredFields.length > 0 ? (
                  <div className="space-y-1">
                    {fieldsVisible.map((tc) => (
                      <FieldItem key={tc.id + tc.code} field={tc} />
                    ))}
                    {filteredFields.length > PAGE_SIZE && (
                      <div className="mt-2 flex items-center justify-between px-1">
                        <button
                          type="button"
                          onClick={() =>
                            setFieldsPage((p) => Math.max(0, p - 1))
                          }
                          disabled={fieldsPage === 0}
                          className="text-xs text-slate-500 disabled:opacity-40"
                        >
                          Anterior
                        </button>
                        <div className="text-xs text-slate-400">
                          {fieldsPage + 1} /{" "}
                          {Math.ceil(filteredFields.length / PAGE_SIZE)}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFieldsPage((p) =>
                              Math.min(
                                Math.ceil(filteredFields.length / PAGE_SIZE) -
                                  1,
                                p + 1
                              )
                            )
                          }
                          disabled={
                            (fieldsPage + 1) * PAGE_SIZE >=
                            filteredFields.length
                          }
                          className="text-xs text-slate-500 disabled:opacity-40"
                        >
                          Siguiente
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="px-3 py-4 text-center text-[10px] text-slate-400">
                    Sin campos en la plantilla.
                  </p>
                )}
              </CollapsiblePanel>

              <CollapsiblePanel title="Tablas / Gráficos" defaultOpen={false}>
                <div className="px-2 pb-2">
                  <Input
                    value={chartsQuery}
                    onChange={(e) => setChartsQuery(e.target.value)}
                    placeholder="Buscar gráficos o tablas..."
                    className="h-10 text-sm"
                  />
                </div>
                {codesLoading ? (
                  <div className="flex items-center justify-center p-6 text-sm text-slate-400">
                    Cargando...
                  </div>
                ) : filteredCharts.length > 0 ? (
                  <div className="space-y-1">
                    {chartsVisible.map((tc) => (
                      <FieldItem key={tc.id + tc.code} field={tc} largeImage />
                    ))}
                    {filteredCharts.length > PAGE_SIZE && (
                      <div className="mt-2 flex items-center justify-between px-1">
                        <button
                          type="button"
                          onClick={() =>
                            setChartsPage((p) => Math.max(0, p - 1))
                          }
                          disabled={chartsPage === 0}
                          className="text-xs text-slate-500 disabled:opacity-40"
                        >
                          Anterior
                        </button>
                        <div className="text-xs text-slate-400">
                          {chartsPage + 1} /{" "}
                          {Math.ceil(filteredCharts.length / PAGE_SIZE)}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setChartsPage((p) =>
                              Math.min(
                                Math.ceil(filteredCharts.length / PAGE_SIZE) -
                                  1,
                                p + 1
                              )
                            )
                          }
                          disabled={
                            (chartsPage + 1) * PAGE_SIZE >=
                            filteredCharts.length
                          }
                          className="text-xs text-slate-500 disabled:opacity-40"
                        >
                          Siguiente
                        </button>
                      </div>
                    )}
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
