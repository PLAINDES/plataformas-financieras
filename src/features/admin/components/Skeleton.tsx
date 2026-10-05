import React from "react";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

export function Skeleton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .skeleton-fade-in {
          animation: fadeIn 350ms cubic-bezier(0.2, 0, 0, 1) forwards;
        }
      `}</style>
      <div className={`skeleton-fade-in ${className}`}>{children}</div>
    </>
  );
}

/* ── Table skeleton (Plantillas, Reportes, Usuarios) ── */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-6">
      {/* Search bar */}
      <SkeletonBlock className="h-10 w-full max-w-sm rounded-lg" />
      {/* Table header */}
      <div className="flex gap-4 border-b border-gray-100 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} className="h-3 flex-1 rounded" />
        ))}
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center gap-4 py-3 border-b border-gray-50">
          {Array.from({ length: cols }).map((_, col) => (
            <SkeletonBlock
              key={col}
              className={`h-4 rounded ${col === 0 ? "w-8" : col === cols - 1 ? "w-16" : "flex-1"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Card gallery skeleton (Portadas) ── */
export function CardGallerySkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <SkeletonBlock className="h-48 w-full rounded-none" />
          <div className="p-4 space-y-2">
            <SkeletonBlock className="h-4 w-3/4 rounded" />
            <SkeletonBlock className="h-3 w-1/2 rounded" />
            <div className="flex gap-2 pt-2">
              <SkeletonBlock className="h-8 flex-1 rounded-lg" />
              <SkeletonBlock className="h-8 flex-1 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── KPI + Chart skeleton (Métricas) ── */
export function MetricsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
            <SkeletonBlock className="h-3 w-24 rounded" />
            <SkeletonBlock className="h-7 w-16 rounded" />
            <SkeletonBlock className="h-2 w-32 rounded" />
          </div>
        ))}
      </div>
      {/* Chart + sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border border-gray-100 bg-white p-5">
          <SkeletonBlock className="h-4 w-40 rounded mb-4" />
          <SkeletonBlock className="h-64 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 space-y-4">
          <SkeletonBlock className="h-4 w-32 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <SkeletonBlock className="h-3 w-20 rounded" />
                <SkeletonBlock className="h-3 w-10 rounded" />
              </div>
              <SkeletonBlock className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
      {/* 3-col tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
            <SkeletonBlock className="h-4 w-36 rounded" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-1">
                <div className="flex justify-between">
                  <SkeletonBlock className="h-3 w-24 rounded" />
                  <SkeletonBlock className="h-3 w-12 rounded" />
                </div>
                <SkeletonBlock className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Config skeleton (tabbed table) ── */
export function ConfigSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-9 w-32 rounded-lg" />
        ))}
      </div>
      {/* Sub tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>
      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="flex gap-4 border-b border-gray-100 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-3 flex-1 rounded" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="flex items-center gap-4 border-b border-gray-50 px-4 py-3">
            {Array.from({ length: 6 }).map((_, col) => (
              <SkeletonBlock key={col} className="h-4 flex-1 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
