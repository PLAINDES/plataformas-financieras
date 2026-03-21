import React from "react";

export interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = "Procesando...",
}) => (
  <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/30">
    <div className="flex flex-col items-center gap-3 rounded-lg bg-white px-6 py-5 shadow-lg">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#009ef7]/30 border-t-[#009ef7]"></div>
      <span className="text-sm font-semibold text-gray-700">{message}</span>
    </div>
  </div>
);
