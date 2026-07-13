import { useState } from "react";
import { Bot, Sparkles, X, Check } from "lucide-react";
import { createPortal } from "react-dom";

export type RateField =
  | "revenue_forecast_rate"
  | "fdc_forecast_rate"
  | "perpetual_growth_rate"
  | "beta_unlevered_sensitivity";

interface BetitoRateModalProps {
  isOpen: boolean;
  field: RateField | null;
  currentValue: string;
  onClose: () => void;
  onInsert: (value: string) => void;
}

const fieldTitles: Record<RateField, string> = {
  revenue_forecast_rate: "Encuentra tu tasa Forecast de ingresos",
  fdc_forecast_rate: "Encuentra tu tasa Forecast de FDC",
  perpetual_growth_rate: "Encuentra tu tasa de Crecimiento Perpetuo",
  beta_unlevered_sensitivity: "Encuentra tu Beta Desapalancado",
};

const fieldSuffix: Record<RateField, string> = {
  revenue_forecast_rate: "%",
  fdc_forecast_rate: "%",
  perpetual_growth_rate: "%",
  beta_unlevered_sensitivity: "Coef.",
};

export const BetitoRateModal: React.FC<BetitoRateModalProps> = ({
  isOpen,
  field,
  currentValue,
  onClose,
  onInsert,
}) => {
  const [status, setStatus] = useState<"idle" | "analyzing" | "done">("idle");
  const [estimatedValue, setEstimatedValue] = useState<string>("");
  const [inserted, setInserted] = useState(false);

  if (!isOpen || !field) return null;

  const title = fieldTitles[field];
  const suffix = fieldSuffix[field];

  const handleAnalyze = () => {
    setStatus("analyzing");
    // Simulación de análisis de IA
    window.setTimeout(() => {
      const base = parseFloat(currentValue) || 0;
      const variation = (Math.random() * 4 - 2); // ±2%
      const estimated = Math.max(0, base + variation);
      setEstimatedValue(estimated.toFixed(2));
      setStatus("done");
    }, 1200);
  };

  const handleInsert = () => {
    onInsert(estimatedValue);
    setInserted(true);
    window.setTimeout(() => {
      onClose();
      setInserted(false);
      setStatus("idle");
      setEstimatedValue("");
    }, 800);
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-valora-primary px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white text-center flex-1">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col items-center gap-4">
          {/* Avatar / Chat header */}
          <div className="w-full flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-valora-primary">
                <Bot size={22} />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Betito</p>
              <p className="text-[11px] text-gray-500">Asistente de valoración</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto p-1 hover:bg-slate-200 rounded-full text-gray-400 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {status === "idle" && (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-valora-primary">
                <Bot size={32} />
              </div>
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                Hola, soy Betito, tu asistente experto en cálculo de tasas de crecimiento y análisis sectorial. ¿En qué puedo ayudarte?
              </p>
              <button
                type="button"
                onClick={handleAnalyze}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-valora-primary text-valora-primary rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Sparkles size={16} />
                Analiza mi tasa forcast actual
              </button>
            </>
          )}

          {status === "analyzing" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-12 h-12 border-3 border-slate-200 border-t-valora-primary rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">Betito está analizando tu tasa...</p>
            </div>
          )}

          {status === "done" && (
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">
                    Tasa Forecast Estimado
                  </p>
                  <p className="text-xl font-black text-valora-primary">
                    {estimatedValue}
                    <span className="text-sm font-bold ml-0.5">{suffix}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleInsert}
                  disabled={inserted}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    inserted
                      ? "bg-green-500 text-white"
                      : "bg-valora-primary text-white hover:bg-valora-secondary"
                  }`}
                >
                  {inserted ? (
                    <>
                      <Check size={14} /> Insertado
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Insertar
                    </>
                  )}
                </button>
              </div>

              {inserted && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                  <div>
                    <p className="text-[11px] text-green-600 font-semibold uppercase tracking-wide">
                      Tasa Forecast Estimado
                    </p>
                    <p className="text-xl font-black text-gray-800">
                      {estimatedValue}
                      <span className="text-sm font-bold ml-0.5">{suffix}</span>
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-green-600 bg-white px-2 py-1 rounded-lg border border-green-200">
                    Valor Insertado
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
