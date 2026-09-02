export interface CalculatedSize {
  colSpan: number;
  rowSpan: number;
}

export const calculateDynamicRowSpan = (
  value: number | null,
  referenceValue: number | null,
  maxRowSpan: number,
  minRowSpan: number
): number => {
  if (value === null || referenceValue === null || referenceValue === 0) {
    return minRowSpan;
  }
  const ratio = Math.abs(value) / Math.abs(referenceValue);
  const clampedRatio = Math.min(Math.max(ratio, 0), 1);
  const rowSpan = Math.round(minRowSpan + (maxRowSpan - minRowSpan) * clampedRatio);
  return Math.max(minRowSpan, Math.min(rowSpan, maxRowSpan));
};

// === NUEVA LÓGICA PROPORCIONAL QUIRÚRGICA (solo altura, ancho intacto) ===
export const getMaxAbs = (...values: Array<number | null | undefined>): number | null => {
  const valid = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v) && v !== null).map((v) => Math.abs(v as number));
  if (valid.length === 0) return null;
  const m = Math.max(...valid);
  return m === 0 ? null : m;
};

export const getProportionalRowSpan = (
  value: number | null,
  maxValue: number | null,
  totalRows: number = 240,
  minRows?: number,
  maxRows?: number
): number => {
  const effectiveMax = maxRows ?? Math.round(totalRows * 0.88);
  // Keep secondary blocks readable when an outlier makes the proportional scale tiny.
  const effectiveMin = minRows ?? 8;
  if (value === null || maxValue === null || maxValue === 0) return effectiveMin;
  const ratio = Math.abs(value) / Math.abs(maxValue);
  const clamped = Math.min(Math.max(ratio, 0), 1);
  // Billions can dwarf the other values; soften only that extreme case so
  // ordinary thousands/millions keep their existing proportions.
  const scaled = Math.abs(maxValue) >= 100_000_000 ? Math.sqrt(clamped) : clamped;
  // metodología origen 0 + dominio filtrado: altura = ratio * effectiveMax, orden estricto, 300k vs 1.2M y 1.214M vs 1.192M ya distinguibles
  const span = Math.round(scaled * effectiveMax);
  return Math.max(effectiveMin, Math.min(span, effectiveMax));
};

export const getBalanceRowSpans = (
  activo: number | null,
  pasivo: number | null,
  patrimonio: number | null,
  maxValue: number | null,
  totalRows: number
) => {
  const extreme = Math.abs(maxValue ?? 0) >= 100_000_000;
  const extremeMinRows = 145;
  const blockMinRows = extreme ? 65 : 8;
  const activoRowSpan = getProportionalRowSpan(activo, maxValue, totalRows, extreme ? extremeMinRows : undefined);
  const sumPP = Math.abs(pasivo ?? 0) + Math.abs(patrimonio ?? 0);
  const maxPasivoRows = Math.max(1, activoRowSpan - blockMinRows);
  const pasivoRowSpan = sumPP > 0
    ? Math.min(maxPasivoRows, Math.max(extreme ? blockMinRows : 4, Math.round((activoRowSpan * Math.abs(pasivo ?? 0)) / sumPP)))
    : Math.round(activoRowSpan / 2);
  return { activoRowSpan, pasivoRowSpan, patrimonioRowSpan: Math.max(blockMinRows, activoRowSpan - pasivoRowSpan) };
};

export const getEmpresaRowSpan = (
  empresaValue: number | null,
  activoValue: number | null,
  isEmergente?: boolean
): number => {
  const max = isEmergente ? 7.5 : 7;
  const min = isEmergente ? 2.5 : 2;
  return calculateDynamicRowSpan(empresaValue, activoValue, max, min);
};

export const getPatrimonioRowSpan = (
  patrimonioValue: number | null,
  referencePatrimonio: number | null,
  overrideReference?: number | null
): number => {
  if (overrideReference !== undefined && overrideReference !== null) {
    return calculateDynamicRowSpan(patrimonioValue, overrideReference, 7, 2);
  }
  return calculateDynamicRowSpan(patrimonioValue, referencePatrimonio, 7, 2);
};

export const getComparisonEmpresaRowSpan = (
  empresaValue: number | null,
  activoValue: number | null,
  isEmergente?: boolean
): number => {
  const max = isEmergente ? 7.5 : 7;
  const min = isEmergente ? 2.5 : 2;
  return calculateDynamicRowSpan(empresaValue, activoValue, max, min);
};

export const getComparisonPatrimonioRowSpan = (
  patrimonioValue: number | null,
  referencePatrimonio: number | null,
  isEmergente?: boolean
): number => {
  const max = isEmergente ? 7.5 : 7;
  const min = isEmergente ? 2.5 : 2;
  return calculateDynamicRowSpan(patrimonioValue, referencePatrimonio, max, min);
};

export const getSensibilidadEmpresaRowSpan = (
  empresaValue: number | null,
  activoValue: number | null,
  isEmergente?: boolean
): number => {
  const max = isEmergente ? 7.5 : 7;
  const min = isEmergente ? 2.5 : 2;
  return calculateDynamicRowSpan(empresaValue, activoValue, max, min);
};

export const getSensibilidadPatrimonioRowSpan = (
  patrimonioValue: number | null,
  referencePatrimonio: number | null,
  isEmergente?: boolean
): number => {
  const max = isEmergente ? 7.5 : 7;
  const min = isEmergente ? 2.5 : 2;
  return calculateDynamicRowSpan(patrimonioValue, referencePatrimonio, max, min);
};

export const formatNumber = (value: number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }
  return value.toLocaleString("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const TrendTriangle = ({
  className,
}: {
  className: string;
}) => (
  <div
    className={`absolute z-20 h-0 w-0 border-x-[18px] border-x-transparent border-b-[36px] border-b-lime-400 ${className}`}
  />
);

const ConnectorLine = ({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke="#9ca3af"
    strokeWidth="1.5"
    strokeDasharray="5 4"
    vectorEffect="non-scaling-stroke"
  />
);

export { ConnectorLine };

import React, { useEffect, useRef, useState } from "react";

type Corner = "top-right" | "top-left" | "bottom-left" | "bottom-right";

interface ConnectorDef {
  fromRef: React.RefObject<HTMLDivElement | null>;
  fromCorner: Corner;
  toRef: React.RefObject<HTMLDivElement | null>;
  toCorner: Corner;
}

const getCornerCoords = (
  rect: DOMRect,
  containerRect: DOMRect,
  corner: Corner
): { x: number; y: number } => {
  const rel = {
    left: rect.left - containerRect.left,
    right: rect.right - containerRect.left,
    top: rect.top - containerRect.top,
    bottom: rect.bottom - containerRect.top,
  };
  switch (corner) {
    case "top-right":
      return { x: rel.right, y: rel.top };
    case "top-left":
      return { x: rel.left, y: rel.top };
    case "bottom-left":
      return { x: rel.left, y: rel.bottom };
    case "bottom-right":
      return { x: rel.right, y: rel.bottom };
  }
};

export const DynamicConnector = ({
  containerRef,
  lines,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  lines: ConnectorDef[];
}) => {
  const [coords, setCoords] = useState<
    Array<{ x1: number; y1: number; x2: number; y2: number }>
  >([]);
  const linesRef = useRef(lines);
  linesRef.current = lines;

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    const maxAttempts = 10;

    const doMeasure = () => {
      const container = containerRef.current;
      if (!container) return false;
      const containerRect = container.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) return false;
      const currentLines = linesRef.current;
      const newCoords = currentLines.map((line) => {
        const fromEl = line.fromRef.current;
        const toEl = line.toRef.current;
        if (!fromEl || !toEl) return null;
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        if (fromRect.width === 0 || toRect.width === 0) return null;
        const from = getCornerCoords(fromRect, containerRect, line.fromCorner);
        const to = getCornerCoords(toRect, containerRect, line.toCorner);
        return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
      });
      const filtered = newCoords.filter(Boolean) as Array<{ x1: number; y1: number; x2: number; y2: number }>;
      if (filtered.length > 0) {
        setCoords(filtered);
        return true;
      }
      return false;
    };

    const tryMeasure = () => {
      if (!mounted || attempts >= maxAttempts) return;
      attempts++;
      const ok = doMeasure();
      if (!ok && mounted) {
        setTimeout(tryMeasure, 30 * attempts);
      }
    };

    tryMeasure();
    const remeasure = () => {
      attempts = 0;
      tryMeasure();
    };
    const ro = new ResizeObserver(remeasure);
    if (containerRef.current) ro.observe(containerRef.current);
    const currentLines = linesRef.current;
    const observedEls = new Set<Element>();
    for (const line of currentLines) {
      const fromEl = line.fromRef.current;
      const toEl = line.toRef.current;
      if (fromEl && !observedEls.has(fromEl)) { ro.observe(fromEl); observedEls.add(fromEl); }
      if (toEl && !observedEls.has(toEl)) { ro.observe(toEl); observedEls.add(toEl); }
    }
    window.addEventListener("resize", remeasure);

    return () => {
      mounted = false;
      ro.disconnect();
      window.removeEventListener("resize", remeasure);
    };
  }, []);

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      style={{ overflow: "visible" }}
    >
      {coords.map((c, i) => (
        <line
          key={i}
          x1={c.x1}
          y1={c.y1}
          x2={c.x2}
          y2={c.y2}
          stroke="#9ca3af"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
};
