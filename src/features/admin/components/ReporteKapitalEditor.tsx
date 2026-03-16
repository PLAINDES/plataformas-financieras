import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  BarChart2,
  Home,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import RichTextEditor from "@/shared/components/ui/TextEditor";

interface TemplateField {
  id: number;
  token: string;
  title: string;
  location: string;
  type: "chart" | "table";
}

interface ReportFormData {
  nombre: string;
  activo: boolean;
  precio: number;
  moneda: string;
  sectorEmpresa: string;
  bonoAjustado: string;
  contenido: string;
  linkPago: string;
  portada: string;
}


interface FieldItemProps {
  field: TemplateField;
}

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const TEMPLATE_FIELDS: TemplateField[] = [
  {
    id: 1,
    token: "$$KMZGY$$",
    title: "Prima de Mercado (Rm - Rf)",
    location: "Mercado Desarrollado",
    type: "table",
  },
  {
    id: 2,
    token: "$$KYZA9$$",
    title: "Costo de Capital Financiero (Ke)",
    location: "Mercado Emergente",
    type: "chart",
  },
  {
    id: 3,
    token: "$$TZYU$$",
    title: "Beta Desapalancado (Boa)",
    location: "Mercado Desarrollado",
    type: "table",
  },
  {
    id: 4,
    token: "$$WPBVC$$",
    title: "Tasa libre de riesgo (Rf)",
    location: "Mercado Desarrollado",
    type: "chart",
  },
  {
    id: 5,
    token: "$$GH7RV$$",
    title: "Prima de Riesgo País (CRP)",
    location: "Mercado Emergente",
    type: "table",
  },
];

const PORTADA_OPTIONS = [
  "Reporte de datos Kapital",
  "Portada Corporativa",
  "Portada Minimalista",
];

const INITIAL_FORM: ReportFormData = {
  nombre: "",
  activo: true,
  precio: 0,
  moneda: "SOLES",
  sectorEmpresa: "Empresa",
  bonoAjustado: "Bono EE.UU.",
  contenido: "Costo de capital del sector",
  linkPago: "",
  portada: "Reporte de datos Kapital",
};

const FieldItem: React.FC<FieldItemProps> = ({ field }) => (
  <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-all hover:border-blue-100 hover:bg-blue-50">
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-100">
      <BarChart2 className="h-3.5 w-3.5 text-blue-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate font-mono text-[11px] font-semibold text-blue-500">
        {field.token}
      </p>
      <p className="truncate text-xs font-medium text-slate-700">{field.title}</p>
      <p className="truncate text-[10px] text-slate-400">{field.location}</p>
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
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
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
  const [form, setForm] = useState<ReportFormData>(INITIAL_FORM);

  const handleChange = <K extends keyof ReportFormData>(
    key: K,
    value: ReportFormData[K],
  ): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <h1 className="text-xs font-bold tracking-widest text-slate-800 uppercase">
          Gestión de Reportes de Kapital
        </h1>
      </header>

      <div className="flex items-center gap-1 px-4 py-2.5 text-[10px] text-slate-500 md:px-6">
        <Home className="h-3 w-3" />
        <span>Home</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-slate-700">Plantillas</span>
      </div>

      <div className="flex flex-col gap-5 px-4 pb-10 md:px-6 lg:flex-row lg:gap-6">
        <div className="flex flex-1 flex-col gap-4 min-w-0">
          <div>
            <h2 className="text-[11px] font-bold tracking-widest text-blue-600 uppercase">
              EDITAR DISEÑO DE REPORTE
            </h2>
            <Separator className="mt-2" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label
                  htmlFor="nombre"
                  className="mb-1 block text-[10px] font-semibold text-slate-600 uppercase"
                >
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  placeholder="Nombre del reporte..."
                  className="h-8 text-xs"
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
                  className="cursor-pointer text-[10px] font-semibold text-slate-600"
                >
                  Activar
                </Label>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  { id: "precio", label: "Precio", type: "number", key: "precio" as const },
                  { id: "moneda", label: "Moneda", type: "text", key: "moneda" as const },
                  { id: "sector", label: "Sector / Empresa", type: "text", key: "sectorEmpresa" as const },
                  { id: "bono", label: "Bono / Ajustado", type: "text", key: "bonoAjustado" as const },
                ] as const
              ).map(({ id, label, type, key }) => (
                <div key={id}>
                  <Label
                    htmlFor={id}
                    className="mb-1 block text-[10px] font-semibold text-slate-600 uppercase"
                  >
                    {label}
                  </Label>
                  <Input
                    id={id}
                    type={type}
                    value={form[key] as string | number}
                    onChange={(e) =>
                      handleChange(
                        key,
                        type === "number" ? Number(e.target.value) : e.target.value,
                      )
                    }
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="w-full sm:w-1/4">
                <Label
                  htmlFor="contenido"
                  className="mb-1 block text-[10px] font-semibold text-slate-600 uppercase"
                >
                  Contenido
                </Label>
                <Input
                  id="contenido"
                  value={form.contenido}
                  onChange={(e) => handleChange("contenido", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex-1">
                <Label
                  htmlFor="linkPago"
                  className="mb-1 block text-[10px] font-semibold text-slate-600 uppercase"
                >
                  Link de pago
                </Label>
                <Input
                  id="linkPago"
                  value={form.linkPago}
                  onChange={(e) => handleChange("linkPago", e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label className="mb-1 block text-[10px] font-semibold text-slate-600 uppercase">
                  Portada
                </Label>
                <Select
                  value={form.portada}
                  onValueChange={(v) => handleChange("portada", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PORTADA_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o} className="text-xs">
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex h-14 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-br from-blue-600 to-blue-800 shadow-sm">
                <div className="text-center">
                  <BarChart2 className="mx-auto h-4 w-4 text-blue-200" />
                  <p className="mt-0.5 text-[8px] font-bold leading-tight text-blue-100">
                    KAPITAL
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <code className="rounded bg-violet-100 px-1 py-0.5 font-mono text-[10px] font-semibold text-violet-700 whitespace-nowrap">
                    $BLOQUE_INICIO$
                  </code>
                  <span className="text-[10px] text-violet-600">
                    Inicia una fila de columnas
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="rounded bg-violet-100 px-1 py-0.5 font-mono text-[10px] font-semibold text-violet-700 whitespace-nowrap">
                    $BLOQUE_FIN$
                  </code>
                  <span className="text-[10px] text-violet-600">
                    Cierra la fila iniciada
                  </span>
                </div>
                <div className="pt-1">
                  <p className="font-mono text-[10px] text-violet-500">
                    $$W6OMQ$$[*height:350px;][.col-6]
                  </p>
                  <p className="text-[10px] text-violet-400 mt-0.5">
                    Estilos: [*height:350px;*width:50%;]
                  </p>
                  <p className="text-[10px] text-violet-400">
                    Clases: [.col-2.col-3.col-4]
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wide">
                  Columnas disponibles
                </p>
                <p className="font-mono text-[10px] text-violet-500">
                  [1|2|3|4|5|6|7|8|9|10|11|12]
                </p>
                <p className="text-[10px] text-violet-500">
                  Las clases{" "}
                  <code className="rounded bg-violet-100 px-0.5 font-mono text-violet-700">
                    col-*
                  </code>{" "}
                  se comportan como columnas dentro de un bloque.
                </p>
                <div className="pt-1 space-y-1">
                  <p className="text-[10px] font-semibold text-violet-600">Texto:</p>
                  <p className="font-mono text-[10px] text-violet-500">
                    {"{"}{"= hola ="}{"}"} o {"{"}{"= hola ="}{"}"}{"[.col-6]"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <RichTextEditor />

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8">
              Cancelar
            </Button>
            <Button size="sm" className="bg-blue-600 text-xs h-8 text-white hover:bg-blue-700">
              Guardar reporte
            </Button>
          </div>
        </div>

        <aside className="w-full lg:w-96 xl:w-[26rem] flex-shrink-0">
          <h2 className="mb-3 text-[11px] font-bold tracking-widest text-slate-700 uppercase">
            Estructura de Tablas y Gráficos
          </h2>

          <div className="flex flex-col gap-3">
            <CollapsiblePanel title="Campos" defaultOpen>
              <div className="space-y-1">
                {TEMPLATE_FIELDS.map((field) => (
                  <FieldItem key={field.id} field={field} />
                ))}
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Tablas / Gráficos" defaultOpen={false}>
              <p className="px-3 py-4 text-center text-[10px] text-slate-400">
                Sin elementos configurados.
              </p>
            </CollapsiblePanel>

          </div>
        </aside>
      </div>
    </div>
  );
};

export default ReporteKapitalEditor;