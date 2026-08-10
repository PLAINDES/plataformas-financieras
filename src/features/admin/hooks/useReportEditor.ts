// useReportEditor.ts
import { useState, useEffect } from "react";
import { MainService } from "@/shared/services/main.service";
import {
  replaceCodesWithValues,
  generateAndUploadReportPdf,
  previewReportPdf,
} from "../utils/pdfGenerator";
import type { Report, TemplateCodeBasic, Cover } from "@/shared/types";

export interface ReportFormData {
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
    type: report.type ?? "kapital",
  };
}

export function useReportEditor(id?: string) {
  const isEdit = Boolean(id);
  const [form, setForm] = useState<ReportFormData>(INITIAL_FORM);
  const [report, setReport] = useState<Report | null>(null);
  const [covers, setCovers] = useState<Cover[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editorKey, setEditorKey] = useState(0);
  const [editorContent, setEditorContent] = useState<string>("");
  const [contentReady, setContentReady] = useState(false);

  const [currentTemplateCodes, setCurrentTemplateCodes] = useState<
    TemplateCodeBasic[] | null
  >(null);
  const [codesLoading, setCodesLoading] = useState(false);

  // Obtiene la lista de portadas
  useEffect(() => {
    MainService.getCovers().then(setCovers);
  }, []);

  // Obtiene los códigos de plantilla maestros
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
            if (typeof item === "string") {
              codes.push({
                id: -1,
                nombre: item,
                code: item,
                type: t as any,
                value: null,
                hoja: null,
              });
            } else if (item.code) {
              const nombre =
                item.nombre ?? item.original_name ?? item.filename ?? item.code;
              codes.push({
                id: item.id ?? -1,
                nombre,
                code: item.code,
                type: t as any,
                hoja: item.hoja ?? null,
                value: item.value ?? null,
                template_code_image_url: item.template_code_image_url,
              });
            }
          }
        });
        setCurrentTemplateCodes(codes);
      })
      .catch(() => setCurrentTemplateCodes([]))
      .finally(() => setCodesLoading(false));
  }, []);

  // Obtiene los datos del reporte seleccionado
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
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const templateCodes =
    report?.template?.template_codes ?? currentTemplateCodes ?? [];
  const portadaUrl = report?.portada?.portada?.url;
  const selectedCover = form.portadaId
    ? covers.find((c) => c.id === form.portadaId)
    : undefined;
  const selectedCoverUrl = selectedCover?.portada?.url ?? portadaUrl ?? null;

  const handleAddCode = (codeObj: TemplateCodeBasic) => {
    let displayValue = "N/D";
    if (codeObj.value !== undefined && codeObj.value !== null) {
      displayValue = !isNaN(Number(codeObj.value))
        ? Number(codeObj.value).toFixed(2)
        : String(codeObj.value);
    }
    const hoverText = `${codeObj.nombre}: ${displayValue}`;
    const codeHtml = `<span class="editor-code-tag" title="${hoverText}" style="background-color: #f1f5f9; color: #3b82f6; padding: 2px 6px; border-radius: 4px; border: 1px solid #bfdbfe; font-family: monospace; font-size: 11px; cursor: help;">${codeObj.code}</span>`;

    setEditorContent((prev) => {
      const trimmed = prev.trim();
      const lastTagMatch = trimmed.match(/(<\/[a-zA-Z0-9]+>)$/i);
      if (lastTagMatch && lastTagMatch.index !== undefined) {
        return (
          trimmed.substring(0, lastTagMatch.index) +
          codeHtml +
          trimmed.substring(lastTagMatch.index)
        );
      }
      return prev + codeHtml;
    });
    setEditorKey((k) => k + 1);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let reportId = id ? Number(id) : undefined;
      const reportPayload = {
        ...form,
        contentEditor: editorContent,
        portada_id: form.portadaId,
      };

      if (!reportId) {
        const created = await MainService.createReport(reportPayload);
        reportId = created.id;
      } else {
        await MainService.updateReport(Number(reportId), reportPayload);
      }

      if (reportId) {
        const finalHtmlForPdf = replaceCodesWithValues(
          editorContent,
          templateCodes
        );
        await generateAndUploadReportPdf(
          reportId,
          finalHtmlForPdf,
          editorContent,
          selectedCoverUrl
        );
      }
      return true; // Retorna verdadero si tiene éxito
    } catch (err: any) {
      console.error(err);
      return false; // Retorna falso si falla
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    setSaving(true);
    try {
      const finalHtmlForPdf = replaceCodesWithValues(
        editorContent,
        templateCodes
      );
      await previewReportPdf(finalHtmlForPdf, selectedCoverUrl, false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return {
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
  };
}
