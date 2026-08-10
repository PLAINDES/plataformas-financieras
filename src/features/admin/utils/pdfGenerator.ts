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
        replacement = `<img src="${codeObj.template_code_image_url}" alt="${codeObj.nombre}" crossorigin="anonymous" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; display: block;" />`;
      } else {
        let displayValue = codeObj.value ?? "N/D";
        if (displayValue !== "N/D" && !isNaN(Number(displayValue))) {
          displayValue = Number(displayValue).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
        replacement = displayValue;
      }

      const escapedCode = codeObj.code.replace(/\$/g, "\\$");
      const spanRegex = new RegExp(
        `<span[^>]*>\\s*${escapedCode}\\s*</span>`,
        "gi"
      );

      if (spanRegex.test(finalHtml)) {
        finalHtml = finalHtml.replace(spanRegex, replacement);
      } else {
        finalHtml = finalHtml.split(codeObj.code).join(replacement);
      }
    }
  });

  return finalHtml;
};

type RenderPdfOptions = {
  coverUrl?: string | null;
  previewLocked?: boolean;
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const buildLockedPreviewCanvas = (
  sourceCanvas: HTMLCanvasElement,
  pageHeightPx: number
) => {
  const output = document.createElement("canvas");
  output.width = sourceCanvas.width;
  output.height = sourceCanvas.height;

  const ctx = output.getContext("2d");
  if (!ctx) return sourceCanvas;

  ctx.drawImage(sourceCanvas, 0, 0);

  const lockStartPx = Math.max(pageHeightPx * 2, 0);
  const lockHeightPx = Math.max(sourceCanvas.height - lockStartPx, 0);
  if (lockHeightPx <= 0) return output;

  ctx.save();
  ctx.filter = "blur(8px)";
  ctx.drawImage(
    sourceCanvas,
    0,
    lockStartPx,
    sourceCanvas.width,
    lockHeightPx,
    0,
    lockStartPx,
    sourceCanvas.width,
    lockHeightPx
  );
  ctx.restore();

  const cardWidth = Math.min(sourceCanvas.width * 0.74, 760);
  const cardHeight = Math.min(lockHeightPx * 0.34, 360);
  const cardX = (sourceCanvas.width - cardWidth) / 2;
  const cardY = lockStartPx + Math.max((lockHeightPx - cardHeight) / 3.5, 60);

  ctx.save();
  ctx.shadowColor = "rgba(8, 32, 62, 0.28)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = "#0b2a52";
  drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 28);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const centerX = sourceCanvas.width / 2;

  ctx.font = "700 34px Arial";
  ctx.fillText("Reporte bloqueado", centerX, cardY + 56);

  ctx.font = "400 21px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.fillText(
    "Desea tener acceso completo al documento?",
    centerX,
    cardY + 110
  );
  ctx.fillText(
    "Adquiera su reporte y desbloquee todo el contenido.",
    centerX,
    cardY + 144
  );

  const checks = [
    "Acceso al documento completo",
    "Descarga del reporte final",
    "Contenido actualizado y verificado",
  ];
  const checkStartY = cardY + cardHeight - 102;
  const checkX = centerX - 220;
  ctx.font = "600 18px Arial";
  checks.forEach((label, index) => {
    const y = checkStartY + index * 28;
    ctx.fillStyle = "#55c8ff";
    ctx.fillText("✓", checkX, y);
    ctx.fillStyle = "#eaf4ff";
    ctx.textAlign = "left";
    ctx.fillText(label, checkX + 28, y);
    ctx.textAlign = "center";
  });

  ctx.fillStyle = "#8cd0ff";
  ctx.font = "700 16px Arial";
  ctx.fillText(
    "Adquiera el reporte para liberar las páginas siguientes",
    centerX,
    cardY + cardHeight - 28
  );
  ctx.restore();

  return output;
};

// Utilidad base para renderizar el lienzo
const renderPdfCanvas = async (
  htmlContent: string,
  options: RenderPdfOptions = {}
) => {
  const { coverUrl, previewLocked = false } = options;
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

  const coverHtml = coverUrl
    ? `<div class="__rk_cover"><img src="${coverUrl}" alt="Portada" crossorigin="anonymous" /></div>`
    : "";

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0;background:transparent}
    body{width:794px}
    .__rk_cover{
      width:794px;
      height:1123px;
      page-break-after:always;
      break-after:page;
      overflow:hidden;
      background:#fff;
    }
    .__rk_cover img{
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }
    .__rk_wrapper{
      width:794px;
      padding:40px;
      background:white;
      font-family:sans-serif;
      box-sizing:border-box;
    }
    .__rk_wrapper *{
      box-sizing:border-box;
      max-width:100%;
    }
    .__rk_wrapper p{
      white-space:pre-wrap;
      line-height:1.45;
      overflow-wrap:break-word;
      word-break:normal;
      margin:0 0 0.9em;
    }
    .__rk_wrapper p:empty::before{
      content:"\\00a0";
    }
    .__rk_wrapper p:has(> br:only-child)::before{
      content:"\\00a0";
    }
    .__rk_wrapper table{
      width:100% !important;
      border-collapse:collapse;
      table-layout:fixed;
    }
    .__rk_wrapper td, .__rk_wrapper th{
      padding:8px 12px;
      overflow-wrap:break-word;
      word-break:normal;
    }
    .__rk_wrapper blockquote{
      padding:12px 16px;
      margin:0 0 1em;
    }
    .__rk_wrapper img{
      max-width:100%;
      height:auto;
    }
  </style></head><body>${coverHtml}<div class="__rk_wrapper">${sanitized}</div></body></html>`;
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
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageHeightPx = Math.round((canvas.width * pageHeight) / imgWidth);
  const workingCanvas =
    previewLocked && canvas.height > pageHeightPx * 2
      ? buildLockedPreviewCanvas(canvas, pageHeightPx)
      : canvas;
  const imageData = workingCanvas.toDataURL("image/jpeg", 0.95);
  const imgHeight = (workingCanvas.height * imgWidth) / workingCanvas.width;

  let y = 0;
  while (y < imgHeight) {
    pdf.addImage(imageData, "JPEG", 0, -y, imgWidth, imgHeight);
    y += pageHeight;
    if (y < imgHeight) pdf.addPage();
  }

  return pdf;
};

// Guarda y sube a BD
export const generateAndUploadReportPdf = async (
  reportId: number,
  htmlForPdf: string,
  rawHtml: string,
  coverUrl?: string | null
) => {
  const pdf = await renderPdfCanvas(htmlForPdf, { coverUrl });
  const formData = new FormData();

  formData.append("file", pdf.output("blob"), `Reporte-${reportId}.pdf`);
  formData.append("html", rawHtml);

  await MainService.uploadReportFile(reportId, formData);
};

// Solo previsualiza en navegador
export const previewReportPdf = async (
  htmlContent: string,
  coverUrl?: string | null,
  previewLocked = false
) => {
  const pdf = await renderPdfCanvas(htmlContent, {
    coverUrl,
    previewLocked,
  });
  const blobUrl = URL.createObjectURL(pdf.output("blob"));
  window.open(blobUrl, "_blank");
};
