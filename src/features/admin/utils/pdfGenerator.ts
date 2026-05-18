// src/features/reports/utils/pdfGenerator.ts
import { MainService } from "@/shared/services/main.service";
import type { TemplateCodeBasic } from "@/shared/types";

// Reemplaza los códigos por sus valores o imágenes
export const replaceCodesWithValues = (
  htmlContent: string,
  codes: TemplateCodeBasic[]
) => {
  let finalHtml = htmlContent;

  codes.forEach((codeObj) => {
    if (finalHtml.includes(codeObj.code)) {
      let replacement = "";

      if (codeObj.template_code_image_url) {
        // Es un gráfico/tabla: Insertar etiqueta de imagen
        replacement = `<img src="${codeObj.template_code_image_url}" alt="${codeObj.nombre}" crossorigin="anonymous" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; display: block;" />`;
      } else {
        // Es un valor numérico/texto: Formatear
        let displayValue = codeObj.value ?? "N/D";
        if (displayValue !== "N/D" && !isNaN(Number(displayValue))) {
          displayValue = Number(displayValue).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
        replacement = displayValue;
      }

      // Eliminar el span visual del editor (si se insertó usando el botón)
      const escapedCode = codeObj.code.replace(/\$/g, "\\$");
      const spanRegex = new RegExp(
        `<span[^>]*>\\s*${escapedCode}\\s*</span>`,
        "gi"
      );

      if (spanRegex.test(finalHtml)) {
        finalHtml = finalHtml.replace(spanRegex, replacement);
      } else {
        // Fallback por si el usuario lo escribió manualmente sin el span
        finalHtml = finalHtml.split(codeObj.code).join(replacement);
      }
    }
  });

  return finalHtml;
};

// Utilidad base para renderizar el lienzo
const renderPdfCanvas = async (htmlContent: string) => {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const sanitizeContent = (html: string) =>
    html
      .replace(/oklch\([^)]*\)(?:\/[^)\s;\"]*)?/gi, "#333333")
      .replace(/oklab\([^)]*\)(?:\/[^)\s;\"]*)?/gi, "#333333");

  const sanitized = sanitizeContent(htmlContent);

  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "width:794px;height:auto;position:absolute;top:-9999px;left:0;border:0;";
  document.body.appendChild(iframe);

  const idoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!idoc) throw new Error("Could not create iframe");

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent} .__rk_wrapper{width:794px;padding:40px;background:white;font-family:sans-serif;box-sizing:border-box}</style></head><body><div class="__rk_wrapper">${sanitized}</div></body></html>`;
  idoc.open();
  idoc.write(html);
  idoc.close();

  const images = Array.from(idoc.images);
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  await new Promise<void>((res) => setTimeout(res, 150));

  const target = idoc.querySelector(".__rk_wrapper") as HTMLElement;
  const canvas = await html2canvas(target, { scale: 2, useCORS: true });
  document.body.removeChild(iframe);

  const pdf = new jsPDF({ unit: "px", format: "a4", orientation: "portrait" });
  const imgWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

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
    y += pdf.internal.pageSize.getHeight();
    if (y < imgHeight) pdf.addPage();
  }

  return pdf;
};

// Guarda y sube a BD
export const generateAndUploadReportPdf = async (
  reportId: number,
  htmlForPdf: string,
  rawHtml: string
) => {
  const pdf = await renderPdfCanvas(htmlForPdf);
  const formData = new FormData();

  formData.append("file", pdf.output("blob"), `Reporte-${reportId}.pdf`);
  formData.append("html", rawHtml); // Enviar el HTML sin sanitizar para que el backend pueda extraer los códigos

  await MainService.uploadReportFile(reportId, formData);
};

// Solo previsualiza en navegador
export const previewReportPdf = async (htmlContent: string) => {
  const pdf = await renderPdfCanvas(htmlContent);
  const blobUrl = URL.createObjectURL(pdf.output("blob"));
  window.open(blobUrl, "_blank");
};
