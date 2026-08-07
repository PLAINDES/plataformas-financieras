import { useState } from "react";
import { ValoraGeneralResultsBlock } from "./ValoraGeneralResultsBlock";
import { ValoraSensibilidadResultsBlock } from "./ValoraSensibilidadResultsBlock";

type TabView = "original" | "sensibility" | "comparison";

const TABS: { id: TabView; label: string }[] = [
  { id: "original", label: "Original" },
  { id: "sensibility", label: "Sensibilidad" },
  { id: "comparison", label: "Comparación" },
];

export interface ValoraSensibilidadSectionProps {
  onOpenFormPanel?: () => void;
  hasSensitized?: boolean;
  sector?: string;
}

export const ValoraSensibilidadSection: React.FC<ValoraSensibilidadSectionProps> = ({
  onOpenFormPanel,
  hasSensitized = false,
  sector,
}) => {
  const [activeTab, setActiveTab] = useState<TabView>("original");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <div className="flex gap-1 bg-slate-200/70 p-1 rounded-xl shadow-inner border border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => !((tab.id === "sensibility" || tab.id === "comparison") && !hasSensitized) && setActiveTab(tab.id)}
              disabled={(tab.id === "sensibility" || tab.id === "comparison") && !hasSensitized}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-valora-primary shadow-sm"
                  : "text-slate-500 hover:text-valora-primary hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "original" && (
        <div className="mx-auto w-full max-w-300">
          <ValoraGeneralResultsBlock
            onOpenFormPanel={onOpenFormPanel}
          />
        </div>
      )}

      {activeTab === "sensibility" && hasSensitized && (
        <div className="mx-auto w-full max-w-300">
          <ValoraSensibilidadResultsBlock
            onOpenFormPanel={onOpenFormPanel}
            sector={sector}
          />
        </div>
      )}

      {activeTab === "comparison" && hasSensitized && (
        <div className="flex flex-row gap-6 items-start w-full">
          <div className="min-w-0 flex-1">
            <ValoraGeneralResultsBlock />
          </div>
          <div className="min-w-0 flex-1 flex flex-col gap-4">
            <ValoraSensibilidadResultsBlock sector={sector} />
          </div>
        </div>
      )}
    </div>
  );
};
