import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, BarChart2, Home } from "lucide-react";
import Breadcrumbs from "@/shared/components/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/shared/components/ui/TextEditor";

import { TemplateCodesSideBar } from "./TemplateCodesSideBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReportEditor } from "../hooks/useReportEditor";

const DEFAULT_CONTENT = "";

export const ReporteKapitalEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    isEdit,
    form,
    covers,
    loading,
    saving,
    error,
    editorKey,
    editorContent,
    contentReady,
    templateCodes,
    codesLoading,
    selectedCoverUrl,
    handleChange,
    handleAddCode,
    handleSave,
    handlePreview,
    setEditorContent,
  } = useReportEditor(id);

  const [info, setInfo] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  const onSaveClick = async () => {
    const success = await handleSave();
    if (success) navigate("/admin/reportes");
    else alert("Error al guardar el reporte. Revisa la consola.");
  };

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
                      options: undefined,
                    },
                    {
                      id: "moneda",
                      label: "Moneda",
                      type: "text",
                      key: "moneda" as const,
                      options: undefined,
                    },
                    {
                      id: "sector",
                      label: "Sector / Empresa",
                      type: "select",
                      key: "sectorEmpresa" as const,
                      options: ["Empresa", "Sectorial"],
                    },
                    {
                      id: "bono",
                      label: "Bono / Ajustado",
                      type: "select",
                      key: "bonoAjustado" as const,
                      options: ["Bono EE.UU", "Ajustado Rf"],
                    },
                  ] as const
                ).map(({ id: fieldId, label, type, key, options }) => (
                  <div key={fieldId}>
                    <Label
                      htmlFor={fieldId}
                      className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase"
                    >
                      {label}
                    </Label>
                    {type === "select" ? (
                      <select
                        id={fieldId}
                        value={form[key] as string}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 cursor-pointer"
                      >
                        <option value="" disabled>
                          Seleccione...
                        </option>
                        {options?.map((opt: string) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
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
                    )}
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
                  className="relative flex h-24 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-blue-200 shadow-sm bg-linear-to-br from-blue-600 to-blue-800"
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
                variant="secondary"
                size="sm"
                className="bg-slate-100 text-slate-700 text-sm h-9 px-4 hover:bg-slate-200"
                onClick={handlePreview}
                disabled={saving}
              >
                Previsualizar
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 text-sm h-9 px-4 text-white hover:bg-blue-700"
                onClick={onSaveClick}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar reporte"}
              </Button>
            </div>
          </div>

          <TemplateCodesSideBar
            templateCodes={templateCodes}
            codesLoading={codesLoading}
            onAddCode={handleAddCode}
          />
        </div>
      </div>
    </div>
  );
};

export default ReporteKapitalEditor;
