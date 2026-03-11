import { useRef, useState } from "react";

import type { ToastType } from "@/shared/types/toast.types";

export interface UploadTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadTemplate: () => void;
  onUploadTemplate: (file: File) => void;
  onToast: (type: ToastType, message: string) => void;
}

export const UploadTemplateModal: React.FC<UploadTemplateModalProps> = ({
  isOpen,
  onClose,
  onDownloadTemplate,
  onUploadTemplate,
  onToast,
}) => {
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFileName(file ? file.name : "");
    setSelectedFile(file ?? null);
    if (file) {
      onToast("info", `Archivo seleccionado: ${file.name}`);
    }
  };

  const handleClearFile = () => {
    setSelectedFileName("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      onToast("warn", "Selecciona un archivo antes de subirlo.");
      return;
    }

    onUploadTemplate(selectedFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-200 pt-2 pb-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Plantilla de valorización
          </h3>
          <button
            type="button"
            className="rounded p-1 text-blue-600"
            aria-label="Cerrar modal"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="border-dashed border-blue-600 border rounded flex flex-row gap-3 bg-blue-600/10 p-4 px-6 items-center">
            <i className="fs-2tx me-2 fa-solid fa-circle-info text-blue-600 text-4xl"></i>
            <p className="text-[15px] text-gray-800">
              Sus estados financieros deben estar en la plantilla para poder
              llenar la información
            </p>
          </div>
          <div className="border-dashed border-blue-600 border rounded flex flex-row gap-3 bg-blue-600/10 p-4 px-6 items-center">
            <i className="fa-solid fa-file-arrow-up me-4 my-auto fs-2tx text-blue-600 text-4xl"></i>
            <div className="w-full">
              <p className="text-sm font-semibold text-gray-800">
                Haga clic para cargar
              </p>
              <p className="text-xs text-gray-600">Sube hasta 1 archivo</p>
              <label className="mt-3 flex w-full cursor-pointer items-center justify-center rounded border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-600 hover:text-white">
                Seleccionar archivo
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {selectedFileName && (
                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-700">
                  <span className="truncate">{selectedFileName}</span>
                  <button
                    type="button"
                    className="shrink-0 rounded px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-600/10"
                    onClick={handleClearFile}
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            className="text-sm text-blue-600 cursor-pointer self-center"
            onClick={onDownloadTemplate}
          >
            Descargar plantilla de estados financieros{" "}
            <i className="fa-solid fa-download text-primary"></i>
          </button>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            onClick={onClose}
          >
            Cerrar
          </button>
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
            onClick={handleUpload}
          >
            Subir
          </button>
        </div>
      </div>
    </div>
  );
};
